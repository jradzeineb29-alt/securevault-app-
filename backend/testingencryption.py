from app.services.encryption_service import (
    encrypt_password,
    decrypt_password
)

password = "123456789"

encrypted = encrypt_password(password)

print("Encrypted:", encrypted)

decrypted = decrypt_password(encrypted)

print("Decrypted:", decrypted)