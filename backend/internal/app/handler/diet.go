package handler

import (
	"RIP/internal/app/ds"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// GET /api/diet/productscart - иконка корзины

// GetCartBadge godoc
// @Summary      Получить информацию для иконки корзины (авторизованный пользователь)
// @Description  Возвращает ID черновика текущего пользователя и количество продуктов в нем.
// @Tags         diet
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200 {object} ds.CartBadgeDTO
// @Failure      401 {object} map[string]string "Необходима авторизация"
// @Router       /diet/productscart [get]
func (h *Handler) GetCartBadge(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		h.errorHandler(c, http.StatusUnauthorized, err)
		return
	}

	draft, err := h.Repository.GetDraftDiet(userID)
	if err != nil {
		c.JSON(http.StatusOK, ds.CartBadgeDTO{
			DietID: nil,
			Count:  0,
		})
		return
	}

	fullDiet, err := h.Repository.GetDietWithProducts(draft.ID)
	if err != nil {
		logrus.Error("Error getting diet with products:", err)
		c.JSON(http.StatusOK, ds.CartBadgeDTO{
			DietID: nil,
			Count:  0,
		})
		return
	}

	c.JSON(http.StatusOK, ds.CartBadgeDTO{
		DietID: &fullDiet.ID,
		Count:  len(fullDiet.ProductsLink),
	})
}

// GET /api/diet - список заявок с фильтрацией

// ListDiet godoc
// @Summary      Получить список заявок (авторизованный пользователь)
// @Description  Возвращает отфильтрованный список всех сформированных заявок (кроме черновиков и удаленных).
// @Tags         diet
// @Produce      json
// @Security     ApiKeyAuth
// @Param        status query int false "Фильтр по статусу заявки"
// @Param        from query string false "Фильтр по дате 'от' (формат YYYY-MM-DD)"
// @Param        to query string false "Фильтр по дате 'до' (формат YYYY-MM-DD)"
// @Success      200 {array} ds.DietDTO
// @Failure      401 {object} map[string]string "Необходима авторизация"
// @Router       /diet [get]
func (h *Handler) ListDiet(c *gin.Context) {
	userID, err := getUserIDFromContext(c)
	if err != nil {
		h.errorHandler(c, http.StatusUnauthorized, err)
		return
	}
	isModerator := isUserModerator(c)

	status := c.Query("status")
	from := c.Query("from")
	to := c.Query("to")

	dietList, err := h.Repository.DietListFiltered(userID, isModerator, status, from, to)
	if err != nil {
		h.errorHandler(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, dietList)
}

// GET /api/diet/:id - одна заявка с услугами

// GetDiet godoc
// @Summary      Получить одну заявку по ID (авторизованный пользователь)
// @Description  Возвращает полную информацию о заявке, включая привязанные продукты.
// @Tags         diet
// @Produce      json
// @Security     ApiKeyAuth
// @Param        id path int true "ID заявки"
// @Success      200 {object} ds.DietDTO
// @Failure      401 {object} map[string]string "Необходима авторизация"
// @Failure      404 {object} map[string]string "Заявка не найдена"
// @Router       /diet/{id} [get]
func (h *Handler) GetDiet(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	diet, err := h.Repository.GetDietWithProducts(uint(id))
	if err != nil {
		h.errorHandler(c, http.StatusNotFound, err)
		return
	}

	var products []ds.ProductInDietDTO
	for _, link := range diet.ProductsLink {
		products = append(products, ds.ProductInDietDTO{
			ProductID:   link.ProductID,
			Title:       link.Product.Title,
			Text:        link.Product.Text,
			Image:       link.Product.Image,
			C_pol:       link.Product.C_pol,
			N_pol:       link.Product.N_pol,
			Description: link.Description,
		})
	}

	dietDTO := ds.DietDTO{
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
		Products:       products,
	}

	if diet.ModeratorID != nil {
		dietDTO.ModeratorID = &diet.Moderator.ID
	}

	c.JSON(http.StatusOK, dietDTO)
}

// PUT /api/diet/:id - изменение полей заявки

// UpdateDiet godoc
// @Summary      Обновить данные заявки (авторизованный пользователь)
// @Description  Позволяет пользователю обновить поля своей заявки.
// @Tags         diet
// @Accept       json
// @Security     ApiKeyAuth
// @Param        id path int true "ID заявки"
// @Param        updateData body ds.DietUpdateRequest true "Данные для обновления"
// @Success      204 "No Content"
// @Failure      401 {object} map[string]string "Необходима авторизация"
// @Router       /diet/{id} [put]
func (h *Handler) UpdateDiet(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	var req ds.DietUpdateRequest
	if err := c.BindJSON(&req); err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	if err := h.Repository.UpdateDietUserFields(uint(id), req); err != nil {
		h.errorHandler(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusNoContent, gin.H{
		"message": "Данные заявки обновлены",
	})
}

// PUT /api/diet/:id/form - сформировать заявку

// FormDiet godoc
// @Summary      Сформировать заявку (авторизованный пользователь)
// @Description  Переводит заявку из статуса "черновик" в "сформирована".
// @Tags         diet
// @Security     ApiKeyAuth
// @Param        id path int true "ID заявки (черновика)"
// @Success      204 "No Content"
// @Failure      400 {object} map[string]string "Не все поля заполнены"
// @Failure      401 {object} map[string]string "Необходима авторизация"
// @Router       /diet/{id}/form [put]
func (h *Handler) FormDiet(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	userID, err := getUserIDFromContext(c)
	if err != nil {
		h.errorHandler(c, http.StatusUnauthorized, err)
		return
	}

	if err := h.Repository.FormDiet(uint(id), userID); err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusNoContent, gin.H{
		"message": "Заявка сформирована",
	})
}

// PUT /api/diet/:id/resolve - завершить/отклонить заявку

// ResolveDiet godoc
// @Summary      Завершить или отклонить заявку (только модератор)
// @Description  Модератор завершает (с расчетом) или отклоняет заявку.
// @Tags         diet
// @Accept       json
// @Security     ApiKeyAuth
// @Param        id path int true "ID заявки"
// @Param        action body ds.DietResolveRequest true "Действие: 'complete' или 'reject'"
// @Success      204 "No Content"
// @Failure      401 {object} map[string]string "Необходима авторизация"
// @Failure      403 {object} map[string]string "Доступ запрещен"
// @Router       /diet/{id}/resolve [put]
func (h *Handler) ResolveDiet(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	var req ds.DietResolveRequest
	if err := c.BindJSON(&req); err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	userID, err := getUserIDFromContext(c)
	if err != nil {
		h.errorHandler(c, http.StatusUnauthorized, err)
		return
	}

	moderatorID := uint(userID)
	if err := h.Repository.ResolveDiet(uint(id), moderatorID, req.Action); err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusNoContent, gin.H{
		"message": "Заявка обработана модератором",
	})
}

// DELETE /api/diet/:id - удаление заявки

// DeleteDiet godoc
// @Summary      Удалить заявку (авторизованный пользователь)
// @Description  Логически удаляет заявку, переводя ее в статус "удалена".
// @Tags         diet
// @Security     ApiKeyAuth
// @Param        id path int true "ID заявки"
// @Success      204 "No Content"
// @Failure      401 {object} map[string]string "Необходима авторизация"
// @Router       /diet/{id} [delete]
func (h *Handler) DeleteDiet(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	if err := h.Repository.LogicallyDeleteDiet(uint(id)); err != nil {
		h.errorHandler(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusNoContent, gin.H{
		"message": "Заявка удалена",
	})
}

// DELETE /api/diet/:id/products/:product_id - удаление продукта из заявки

// RemoveProductFromDiet godoc
// @Summary      Удалить продукт из заявки (авторизованный пользователь)
// @Description  Удаляет связь между заявкой и продуктом.
// @Tags         m-m
// @Security     ApiKeyAuth
// @Param        id path int true "ID заявки"
// @Param        product_id path int true "ID продукта"
// @Success      204 "No Content"
// @Failure      401 {object} map[string]string "Необходима авторизация"
// @Router       /diet/{id}/products/{product_id} [delete]
func (h *Handler) RemoveProductFromDiet(c *gin.Context) {
	dietID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	productID, err := strconv.Atoi(c.Param("product_id"))
	if err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	if err := h.Repository.RemoveProductFromDiet(uint(dietID), uint(productID)); err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusNoContent, gin.H{
		"message": "Продукт удален из заявки",
	})
}

// PUT /api/diet/:id/products/:product_id - изменение м-м связи

// UpdateMM godoc
// @Summary      Обновить описание продукта в заявке (авторизованный пользователь)
// @Description  Изменяет дополнительное описание для конкретного продукта в рамках одной заявки.
// @Tags         m-m
// @Accept       json
// @Security     ApiKeyAuth
// @Param        id path int true "ID заявки"
// @Param        product_id path int true "ID продукта"
// @Param        updateData body ds.ProductToDietUpdateRequest true "Новое описание"
// @Success      204 "No Content"
// @Failure      401 {object} map[string]string "Необходима авторизация"
// @Router       /diet/{id}/products/{product_id} [put]
func (h *Handler) UpdateMM(c *gin.Context) {
	dietID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	productID, err := strconv.Atoi(c.Param("product_id"))
	if err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	var req ds.ProductToDietUpdateRequest
	if err := c.BindJSON(&req); err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	updateData := ds.ProductToDiet{
		Description: req.Description,
	}

	if err := h.Repository.UpdateMM(uint(dietID), uint(productID), updateData); err != nil {
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusNoContent, gin.H{
		"message": "Дополнительная информация к продукту обновлена",
	})
}

// PUT /api/diet/:id/update-result - получить результат от асинхронного сервиса

// UpdateDietResult godoc
// @Summary      Получить результат расчета от асинхронного сервиса (без авторизации, с токеном)
// @Description  Асинхронный сервис отправляет PUT-запрос с результатом расчета (PGP-значением) для конкретной заявки. Требует валидный auth_token.
// @Tags         diet
// @Accept       json
// @Param        id path int true "ID заявки"
// @Param        resultData body map[string]interface{} true "Данные с результатом: {\"pgp\": <float>, \"auth_token\": \"string\"}"
// @Success      204 "No Content"
// @Failure      400 {object} map[string]string "Неверный токен или отсутствуют данные"
// @Failure      404 {object} map[string]string "Заявка не найдена"
// @Router       /diet/{id}/update-result [put]
func (h *Handler) UpdateDietResult(c *gin.Context) {
	// Константа токена для авторизации асинхронного сервиса
	const ASYNC_SERVICE_TOKEN = "lab8_key"

	logrus.Printf("[UpdateDietResult] Received PUT request")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		logrus.Printf("[UpdateDietResult] Invalid ID parameter: %v", err)
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	logrus.Printf("[UpdateDietResult] Diet ID: %d", id)

	var req map[string]interface{}
	if err := c.BindJSON(&req); err != nil {
		logrus.Printf("[UpdateDietResult] JSON bind error: %v", err)
		h.errorHandler(c, http.StatusBadRequest, err)
		return
	}

	logrus.Printf("[UpdateDietResult] Received payload: %v", req)

	// Проверка токена авторизации
	authToken, ok := req["auth_token"].(string)
	if !ok || authToken != ASYNC_SERVICE_TOKEN {
		logrus.Printf("[UpdateDietResult] Invalid auth_token")
		h.errorHandler(c, http.StatusUnauthorized, fmt.Errorf("invalid or missing auth_token"))
		return
	}

	// Получение PGP значения
	pgpValue, ok := req["pgp"].(float64)
	if !ok {
		logrus.Printf("[UpdateDietResult] Invalid pgp value: %v", req["pgp"])
		h.errorHandler(c, http.StatusBadRequest, fmt.Errorf("missing or invalid pgp value"))
		return
	}

	logrus.Printf("[UpdateDietResult] Updating diet %d with PGP=%.2f", id, pgpValue)

	// Обновление PGP поля в базе данных
	if err := h.Repository.UpdateDietPGP(uint(id), pgpValue); err != nil {
		logrus.Printf("[UpdateDietResult] Database error: %v", err)
		h.errorHandler(c, http.StatusInternalServerError, err)
		return
	}

	logrus.Printf("Diet %d PGP updated to %.2f from async service", id, pgpValue)

	c.Status(http.StatusNoContent)
}
