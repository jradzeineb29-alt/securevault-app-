from cryptography.fernet import Fernet


ENCRYPTION_KEY = b"kgxyuDZoubdqMI-LBdppSG8xWvgRFh8I4ZzaS0zEJ6k="

cipher = Fernet(ENCRYPTION_KEY)


def encrypt_password(password: str) -> str:
    encrypted = cipher.encrypt(
        password.encode()
    )

    return encrypted.decode()


def decrypt_password(encrypted_password: str) -> str:
    decrypted = cipher.decrypt(
        encrypted_password.encode()
    )

    return decrypted.decode()