export const TOKEN_PACKAGES = [
  {
    id: 'starter',
    tokens: 5,
    price: 3.00,
    savings: null,
  },
  {
    id: 'popular',
    tokens: 20,
    price: 10.00,
    popular: true,
    savings: 'Save 17%',
  },
  {
    id: 'value',
    tokens: 50,
    price: 20.00,
    savings: 'Save 33%',
  },
  {
    id: 'bulk',
    tokens: 100,
    price: 35.00,
    savings: 'Save 42%',
  },
];

export const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];