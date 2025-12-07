import * as z from "zod";

const today = new Date();
today.setHours(0, 0, 0, 0);

export const taskValidator = z.object({
    name: z
        .string({
        })
        .min(3, "Мінімум 3 символи")
        .max(120, "Максимум 120 символів"),

    performer: z
        .string()
        .optional()
        .or(z.literal("")),


    status: z.enum(["To do", "In Progress", "Done"], {
    }),

    deadline: z.preprocess((arg) => { // API мокове, не найкраще.Зберігає дату як String. Прийшлось ось так викрутитись
            if (typeof arg === "string" || arg instanceof Date) {
                const d = new Date(arg);
                return !isNaN(d.getTime()) ? d : undefined;
            }
            return undefined;
        }, z.date({
        })
            .min(today, "Термін виконання не може бути раніше сьогоднішнього дня.")
    )
});