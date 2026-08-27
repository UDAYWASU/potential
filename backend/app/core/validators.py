def validate_password(password: str) -> str | None:

    if len(password) < 8:
        return "Password must be at least 8 characters long."

    if len(password) > 128:
        return "Password must not exceed 128 characters."

    if not any(char.isupper() for char in password):
        return "Password must contain at least one uppercase letter."

    if not any(char.islower() for char in password):
        return "Password must contain at least one lowercase letter."

    if not any(char.isdigit() for char in password):
        return "Password must contain at least one number."

    return None