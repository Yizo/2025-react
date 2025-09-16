import { useSyncExternalStore } from "react";

function useOnlineStatus() {
	const isOnline = useSyncExternalStore(subscribe, getSnapshot);

	function subscribe(callback: () => void) {
		window.addEventListener("online", callback);
		window.addEventListener("offline", callback);
		return () => window.removeEventListener("online", callback);
	}

	function getSnapshot() {
		return navigator.onLine;
	}

	return isOnline;
}

export default function Main() {
	const isOnline = useOnlineStatus();
	return (
		<div className="m-6 box">
			<h1>useSyncExternalStore</h1>
			<div className="mt-4">
				<div>isOnline: {isOnline ? "在线" : "离线"}</div>
			</div>
		</div>
	);
}
