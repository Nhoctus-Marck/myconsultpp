import {z} from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Correo electrónico inválido'),
    password: z.string()
    .regex(/[a-zA-Z0-9]/,"Debe tener al menos un Símbolo")
    .regex(/[0-9]/,"Debe tener al menos un Número")
    .regex(/[A-Z]/,"Debe tener al menos una Mayúscula")
    .min(6,'La contraseña debe tener almenos 6 caracteres')
})