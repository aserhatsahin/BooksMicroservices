export interface CommandResponse {
  isSuccessful: boolean;
  message: string;
  id: number;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
}

// ── Books ─────────────────────────────────────────────────────────────────────
export interface AuthorResponse {
  id: number;
  firstName: string;
  lastName: string;
  booksCount: number;
  books: string;
}

export interface GenreResponse {
  id: number;
  name: string;
}

export interface BookResponse {
  id: number;
  name: string;
  publishDate: string | null;
  numberOfPages: number | null;
  price: number;
  isTopSeller: boolean;
  authorId: number;
  genreIds: number[];
  authorF: string;
  genresF: string;
  priceF: string;
  publishDateF: string;
}

export interface BookCreateRequest {
  name: string;
  publishDate: string | null;
  numberOfPages: number | null;
  price: number;
  isTopSeller: boolean;
  authorId: number;
  genreIds: number[];
}

export interface AuthorCreateRequest {
  firstName: string;
  lastName: string;
}

export interface GenreCreateRequest {
  name: string;
}

// ── Users ─────────────────────────────────────────────────────────────────────
export interface RoleResponse {
  id: number;
  name: string;
}

export interface UserResponse {
  id: number;
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: number;
  birthDate: string | null;
  registrationDate: string;
  score: number;
  isActive: boolean;
  address: string | null;
  countryId: number | null;
  cityId: number | null;
  groupId: number | null;
  roleIds: number[];
  fullName: string;
  genderF: string;
  birthDateF: string;
  registrationDateF: string;
  scoreF: string;
  isActiveF: string;
  rolesF: string[];
}

export interface UserCreateRequest {
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: number;
  birthDate: string | null;
  registrationDate: string;
  score: number;
  isActive: boolean;
  address: string | null;
  countryId: number | null;
  cityId: number | null;
  groupId: number | null;
  roleIds: number[];
}

export interface RoleCreateRequest {
  name: string;
}
