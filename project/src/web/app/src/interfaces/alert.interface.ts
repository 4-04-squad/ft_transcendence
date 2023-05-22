export type AlertType = "info" | "success" | "warning" | "error";

export interface AlertInterface {
    type?: string;
    status: number;
    message: string;
	link?: number;
	timeout?: number;
}