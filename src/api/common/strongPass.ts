export function generateStrongPassword(length: number = 16): string {
	 const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
  const charsetLength = charset.length;
  
  // Создаем массив для хранения случайных индексов
  const randomValues = new Uint32Array(length);

  window.crypto.getRandomValues(randomValues);

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % charsetLength;
    password += charset[randomIndex];
  }

  return password;
}