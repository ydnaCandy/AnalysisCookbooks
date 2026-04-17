export interface User {
  id: number
  username: string
  is_admin: boolean
  is_active: boolean
  created_at: string
}

export interface Domain {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface Tag {
  id: number
  name: string
  created_at: string
}

export interface Recipe {
  id: number
  title: string
  description: string | null
  sql_text: string
  domain_id: number
  created_by_id: number
  created_at: string
  updated_at: string
  domain: Domain | null
  tags: Tag[]
  created_by_user: User | null
}

export interface Comment {
  id: number
  recipe_id: number
  user_id: number
  content: string
  created_at: string
  updated_at: string
  user: User | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
