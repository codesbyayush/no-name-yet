import { status as allStatus } from "@/mock-data/status";
import type React from "react";

export function renderStatusIcon(statusId: string): React.ReactElement | null {
	const selectedItem = allStatus.find((item) => item.id === statusId);
	if (selectedItem) {
		const Icon = selectedItem.icon;
		return <Icon />;
	}
	return null;
}

export function getStatusById(statusId: string) {
	return allStatus.find((item) => item.id === statusId);
}
