package ds

import "time"

type ProductDTO struct {
	ID       uint     `json:"id"`
	Title    string   `json:"title"`
	Text     string   `json:"text"`
	Image    *string  `json:"image"`
	C_pol    int      `json:"c_pol"`
	N_pol    int      `json:"n_pol"`
}

type ProductCreateRequest struct {
	Title    string   `json:"title" binding:"required"`
	Text     string   `json:"text" binding:"required"`
	C_pol    int      `json:"c_pol"`
	N_pol    int      `json:"n_pol"`
}

type ProductUpdateRequest struct {
	Title    *string  `json:"title"`
	Text     *string  `json:"text"`
	C_pol    *int      `json:"c_pol"`
	N_pol    *int      `json:"n_pol"`
}

type DietDTO struct {
	ID             uint              `json:"id"`
	Status         int               `json:"status"`
	CreationDate   time.Time         `json:"creation_date"`
	CreatorID      uint              `json:"creator_login"`
	ModeratorID    *uint             `json:"moderator_login"`
	FormingDate    *time.Time        `json:"forming_date"`
	ComplitionDate *time.Time        `json:"complition_date"`
	C_pol          int        		 `json:"c_pol"`
	N_pol          int        		 `json:"n_pol"`
	PRP            *float64   		 `json:"PRP"`
	PGP            *float64   		 `json:"PGP"`
	Products       []ProductInDietDTO `json:"products,omitempty"`
}

type ProductInDietDTO struct {
	ProductID    uint     `json:"product_id"`
	Title       string   `json:"title"`
	Text        string   `json:"text"`
	Image       *string  `json:"image"`
	C_pol       int      `json:"c_pol"`
	N_pol       int      `json:"n_pol"`
	Description *string  `json:"description"`
}

type DietUpdateRequest struct {
	C_pol int      `json:"c_pol" binding:"required"`
	N_pol int      `json:"n_pol" binding:"required"`
	PRP   *float64 `json:"PRP"`
	PGP   *float64 `json:"PGP"`
}

type DietResolveRequest struct {
	Action string `json:"action" binding:"required"` // "complete" | "reject"
}

type ProductToDietUpdateRequest struct {
	Description *string `json:"description"`
}

type CartBadgeDTO struct {
	DietID *uint `json:"diet_id"`
	Count  int   `json:"count"`
}

type UserRegisterRequest struct {
	FullName string `json:"full_name" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UserLoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UserDTO struct {
	ID        uint   `json:"id"`
	FullName  string `json:"full_name"`
	Username  string `json:"username"`
	Moderator bool   `json:"moderator"`
}

type UserUpdateRequest struct {
	FullName *string `json:"full_name"`
	Username *string `json:"username"`
	Password *string `json:"password"`
}

type LoginResponse struct {
	Token string  `json:"token"`
	User  UserDTO `json:"user"`
}

type PaginatedResponse struct {
	Items interface{} `json:"items"`
	Total int64       `json:"total"`
}
