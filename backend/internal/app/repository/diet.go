package repository

import (
	"RIP/internal/app/ds"
	"errors"
	"log"
	"math"
	"strconv"
	"time"

	"gorm.io/gorm"
)

// GET /api/diet/cart - иконка корзины
func (r *Repository) GetDraftDiet(userID uint) (*ds.DietSearching, error) {
	var diet ds.DietSearching
	err := r.db.Where("creator_id = ? AND status = ?", userID, ds.StatusDraft).First(&diet).Error
	if err != nil {
		return nil, err
	}
	return &diet, nil
}

// GET /api/diet/cart - иконка корзины
// GET /api/diet/:id - одна заявка с услугами
func (r *Repository) GetDietWithProducts(dietID uint) (*ds.DietSearching, error) {
	var diet ds.DietSearching
	err := r.db.Preload("ProductsLink.Product").Preload("Creator").Preload("Moderator").First(&diet, dietID).Error
	if err != nil {
		return nil, err
	}

	if diet.Status == ds.StatusDeleted {
		return nil, errors.New("diet page not found or has been deleted")
	}

	return &diet, nil
}

// GET /api/diet - список заявок с фильтрацией
func (r *Repository) DietListFiltered(userID uint, isModerator bool, status, from, to string) ([]ds.DietDTO, error) {
	var dietList []ds.DietSearching
	query := r.db.Preload("Creator").Preload("Moderator")

	query = query.Where("status != ? AND status != ?", ds.StatusDeleted, ds.StatusDraft)

	if !isModerator {
		query = query.Where("creator_id = ?", userID)
	}

	if status != "" {
		if statusInt, err := strconv.Atoi(status); err == nil {
			query = query.Where("status = ?", statusInt)
		}
	}

	if from != "" {
		if fromTime, err := time.Parse("2006-01-02", from); err == nil {
			query = query.Where("forming_date >= ?", fromTime)
		}
	}

	if to != "" {
		if toTime, err := time.Parse("2006-01-02", to); err == nil {
			query = query.Where("forming_date <= ?", toTime)
		}
	}

	if err := query.Find(&dietList).Error; err != nil {
		return nil, err
	}

	var result []ds.DietDTO
	for _, diet := range dietList {
		dto := ds.DietDTO{
			ID:             diet.ID,
			Status:         diet.Status,
			CreationDate:   diet.CreationDate,
			CreatorID:      diet.Creator.ID,
			ModeratorID:    nil,
			FormingDate:    diet.FormingDate,
			ComplitionDate: diet.ComplitionDate,
			C_pol:          diet.C_pol,
			N_pol:          diet.N_pol,
			PRP:            diet.PRP,
			PGP:            diet.PGP,
		}

		if diet.ModeratorID != nil {
			dto.ModeratorID = &diet.Moderator.ID
		}
		result = append(result, dto)
	}
	return result, nil
}

// PUT /api/diet/:id - изменение полей заявки
func (r *Repository) UpdateDietUserFields(id uint, req ds.DietUpdateRequest) error {
	updates := make(map[string]interface{})

	updates["c_pol"] = req.C_pol
	updates["n_pol"] = req.N_pol
	if req.PGP != nil {
		updates["pgp"] = *req.PGP
	}
	if req.PRP != nil {
		updates["prp"] = *req.PRP
	}

	if len(updates) == 0 {
		return nil
	}

	return r.db.Model(&ds.DietSearching{}).Where("id = ?", id).Updates(updates).Error
}

// PUT /api/diet/:id/form - сформировать заявку
func (r *Repository) FormDiet(id uint, creatorID uint) error {
	var diet ds.DietSearching
	if err := r.db.First(&diet, id).Error; err != nil {
		return err
	}

	if diet.CreatorID != creatorID {
		return errors.New("only creator can form diet")
	}

	if diet.Status != ds.StatusDraft {
		return errors.New("only draft diet can be formed")
	}

	if diet.PGP == nil || diet.PRP == nil {
		return errors.New("c_pol, n_pol, pgp and prp are required")
	}

	now := time.Now()
	return r.db.Model(&diet).Updates(map[string]interface{}{
		"status":       ds.StatusFormed,
		"forming_date": now,
	}).Error
}

// PUT /api/diet/:id/resolve - завершить/отклонить заявку
func (r *Repository) ResolveDiet(id uint, moderatorID uint, action string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {

		var diet ds.DietSearching
		if err := tx.Preload("ProductsLink.Product").First(&diet, id).Error; err != nil {
			return err
		}

		if diet.Status != ds.StatusFormed {
			return errors.New("only formed diet can be resolved")
		}

		now := time.Now()
		updates := map[string]interface{}{
			"moderator_id":    moderatorID,
			"complition_date": now,
		}

		switch action {
		case "complete":
			{
				updates["status"] = ds.StatusCompleted
				pof, php := r.calculateDIET(diet)
				updates["PGP"] = pof
				updates["PRP"] = php
			}
		case "reject":
			{
				updates["status"] = ds.StatusRejected
			}
		default:
			{
				return errors.New("invalid action, must be 'complete' or 'reject'")
			}
		}

		if err := tx.Model(&diet).Updates(updates).Error; err != nil {
			return err
		}

		var productIDs []uint
		for _, link := range diet.ProductsLink {
			productIDs = append(productIDs, link.ProductID)
		}

		if len(productIDs) > 0 {
			// NOTE: products table does not have `status` column in current schema.
			// Skipping attempt to update product status to avoid SQL errors.
			log.Printf("ResolveDiet: skipping product status update for productIDs=%v (no status column)", productIDs)
		}
		return nil
	})
}

// Функция расчета
func (r *Repository) calculateDIET(diet ds.DietSearching) (float64, float64) {
	if len(diet.ProductsLink) == 0 {
		return 0, 0 // Нет продуктов - нет расчета
	}

	// Значения C и N индивида
	individualC := float64(diet.C_pol)
	individualN := float64(diet.N_pol)

	var totalPlantSimilarity float64
	var totalAnimalSimilarity float64

	for _, item := range diet.ProductsLink {
		productC := float64(item.Product.C_pol)
		productN := float64(item.Product.N_pol)

		// Рассчитываем "расстояние" между индивидом и продуктом
		// Чем меньше расстояние - тем больше сходство
		distance := math.Sqrt(math.Pow(individualC-productC, 2) + math.Pow(individualN-productN, 2))
		similarity := 1 / (1 + distance) // Преобразуем расстояние в сходство (0-1)

		// Определяем тип пищи на основе характеристик продукта
		// Растительная пища: более отрицательный C_pol (например, -25)
		// Животная пища: менее отрицательный C_pol (например, -15)
		if productC < -20 { // Растительная пища (более отрицательный C)
			totalPlantSimilarity += similarity
		} else { // Животная пища (менее отрицательный C)
			totalAnimalSimilarity += similarity
		}
	}

	// Рассчитываем проценты
	totalSimilarity := totalPlantSimilarity + totalAnimalSimilarity
	if totalSimilarity == 0 {
		return 0, 0
	}

	plantRatio := (totalPlantSimilarity / totalSimilarity) * 100
	animalRatio := (totalAnimalSimilarity / totalSimilarity) * 100

	// Ограничиваем значения 0-100
	plantRatio = math.Max(0, math.Min(100, plantRatio))
	animalRatio = math.Max(0, math.Min(100, animalRatio))

	return plantRatio, animalRatio
}

// DELETE /api/diet/:id - удаление заявки
func (r *Repository) LogicallyDeleteDiet(dietID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var diet ds.DietSearching

		if err := tx.Preload("ProductsLink").First(&diet, dietID).Error; err != nil {
			return err
		}

		updates := map[string]interface{}{
			"status":       ds.StatusDeleted,
			"forming_date": time.Now(),
		}

		if err := tx.Model(&ds.DietSearching{}).Where("id = ?", dietID).Updates(updates).Error; err != nil {
			return err
		}

		var productIDs []uint
		for _, link := range diet.ProductsLink {
			productIDs = append(productIDs, link.ProductID)
		}

		if len(productIDs) > 0 {
			// NOTE: products table does not have `status` column in current schema.
			// Skipping attempt to update product status to avoid SQL errors.
			log.Printf("LogicallyDeleteDiet: skipping product status update for productIDs=%v (no status column)", productIDs)
		}
		return nil
	})
}

// DELETE /api/diet/:id/products/:product_id - удаление фактора из заявки
func (r *Repository) RemoveProductFromDiet(dietID, productID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {

		result := tx.Where("diet_id = ? AND product_id = ?", dietID, productID).Delete(&ds.ProductToDiet{})
		if result.Error != nil {
			return result.Error
		}

		if result.RowsAffected == 0 {
			return errors.New("product not found in this diet")
		}

		// NOTE: products table does not have `status` column in current schema.
		// Skipping update to avoid SQL errors.
		log.Printf("RemoveProductFromDiet: skipping product status update for productID=%d (no status column)", productID)

		var remainingCount int64
		if err := tx.Model(&ds.ProductToDiet{}).Where("diet_id = ?", dietID).Count(&remainingCount).Error; err != nil {
			return err
		}

		if remainingCount == 0 {
			updates := map[string]interface{}{
				"status":       ds.StatusDeleted,
				"forming_date": time.Now(),
			}
			if err := tx.Model(&ds.DietSearching{}).Where("id = ?", dietID).Updates(updates).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// PUT /api/diet/:id/products/:product_id - изменение м-м связи
func (r *Repository) UpdateMM(dietID, productID uint, updateData ds.ProductToDiet) error {
	var link ds.ProductToDiet
	if err := r.db.Where("diet_id = ? AND product_id = ?", dietID, productID).First(&link).Error; err != nil {
		return err
	}

	updates := make(map[string]interface{})
	if updateData.Description != nil {
		updates["description"] = *updateData.Description
	}

	if len(updates) == 0 {
		return nil
	}

	return r.db.Model(&link).Updates(updates).Error
}

// PUT /api/diet/:id/update-result - обновить PGP результат от асинхронного сервиса
func (r *Repository) UpdateDietPGP(dietID uint, pgpValue float64) error {
	log.Printf("[UpdateDietPGP] Attempting to update diet %d with PGP=%.2f", dietID, pgpValue)

	var diet ds.DietSearching
	if err := r.db.First(&diet, dietID).Error; err != nil {
		log.Printf("[UpdateDietPGP] Error finding diet: %v", err)
		return err
	}

	// Обновляем PGP значение
	if err := r.db.Model(&diet).Update("PGP", pgpValue).Error; err != nil {
		log.Printf("[UpdateDietPGP] Error updating PGP: %v", err)
		return err
	}

	log.Printf("[UpdateDietPGP] Diet %d PGP updated to %.2f successfully", dietID, pgpValue)
	return nil
}
