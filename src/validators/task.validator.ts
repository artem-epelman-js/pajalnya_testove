import * as z from "zod";
import { TaskInterface } from "../interfaces/task.interface";

export const taskValidator = z.object({
    name: z
        .string()
        .min(3, "Мінімум 3 символи")
        .max(120, "Максимум 120 символів"),

    performer: z.string().optional(),

    status: z.enum(["To do", "In progress", "Done"]),

    deadline: z
        .string()
});
