from flask_login import UserMixin
from db import get_db_connection

class User(UserMixin):
    def __init__(self, id, usuario, password, nombre):
        self.id = id
        self.usuario = usuario
        self.password = password
        self.nombre = nombre  # <--- Agregamos el nombre aquí

    @staticmethod
    def get_by_usuario(usuario):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Seleccionamos todos los campos para asegurar que traemos el nombre
        sql = "SELECT * FROM empleado WHERE usuario = %s"
        cursor.execute(sql, (usuario,))

        row = cursor.fetchone()

        cursor.close()
        conn.close()  

        if row:
            return User(
                id=row["id_empleado"],
                usuario=row["usuario"],
                password=row["contrasena_hash"],
                nombre=row["nombre"] # <--- Mapeamos el nombre de la DB
            )
        return None

    @staticmethod
    def get_by_id(user_id):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        sql = "SELECT * FROM empleado WHERE id_empleado = %s"
        cursor.execute(sql, (user_id,))

        row = cursor.fetchone()

        cursor.close()
        conn.close()  

        if row:  
            return User(
                id=row["id_empleado"],
                usuario=row["usuario"],
                password=row["contrasena_hash"],
                nombre=row["nombre"] # <--- Mapeamos el nombre de la DB
            )
        return None