import * as z from "zod";


export const projectValidator = z.object({
    name: z.string().regex(/[A-Za-zА-Яа-яІіЇїЄєҐґ]/, 'Назва не може складатися лише з цифр'),
    description: z.string().optional(),
})