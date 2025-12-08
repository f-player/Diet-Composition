package handler

import (
	"RIP/internal/app/config"
	"RIP/internal/app/redis"
	"RIP/internal/app/repository"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type Handler struct {
	Repository *repository.Repository
	Redis      *redis.Client
	JWTConfig  *config.JWTConfig
}

func NewHandler(r *repository.Repository, redis *redis.Client, jwtConfig *config.JWTConfig) *Handler {
	return &Handler{
		Repository: r,
		Redis:      redis,
		JWTConfig:  jwtConfig,
	}
}

func (h *Handler) RegisterAPI(r *gin.RouterGroup) {

	// Доступны всем
	r.POST("/users", h.Register)
	r.POST("/auth/login", h.Login)
	r.GET("/products", h.GetProducts)
	r.GET("/products/:id", h.GetProduct)

	// Эндпоинты, доступные только авторизованным пользователям
	auth := r.Group("/")
	auth.Use(h.AuthMiddleware)
	{
		// Пользователи
		auth.POST("/auth/logout", h.Logout)
		auth.GET("/users/:id", h.GetUserData)
		auth.PUT("/users/:id", h.UpdateUserData)
		// Заявки
		auth.POST("/diet/draft/products/:product_id", h.AddProductToDraft)
		auth.GET("/diet/productscart", h.GetCartBadge)
		auth.GET("/diet", h.ListDiet)
		auth.GET("/diet/:id", h.GetDiet)
		auth.PUT("/diet/:id", h.UpdateDiet)
		auth.PUT("/diet/:id/form", h.FormDiet)
		auth.DELETE("/diet/:id", h.DeleteDiet)
		auth.DELETE("/diet/:id/products/:product_id", h.RemoveProductFromDiet)
		auth.PUT("/diet/:id/products/:product_id", h.UpdateMM)
	}

	// Эндпоинты, доступные только модераторам
	moderator := r.Group("/")
	moderator.Use(h.AuthMiddleware, h.ModeratorMiddleware)
	{
		// Управление продуктами (создание, изменение, удаление)
		moderator.POST("/products", h.CreateProduct)
		moderator.PUT("/products/:id", h.UpdateProduct)
		moderator.DELETE("/products/:id", h.DeleteProduct)
		moderator.POST("/products/:id/image", h.UploadProductImage)

		// Управление заявками (завершение/отклонение)
		moderator.PUT("/diet/:id/resolve", h.ResolveDiet)
	}

	// Callback endpoint для асинхронного сервиса (без авторизации, требует токен)
	r.PUT("/diet/:id/update-result", h.UpdateDietResult)
}

func (h *Handler) errorHandler(ctx *gin.Context, errorStatusCode int, err error) {
	logrus.Error(err.Error())
	ctx.JSON(errorStatusCode, gin.H{
		"status":      "error",
		"description": err.Error(),
	})
}
