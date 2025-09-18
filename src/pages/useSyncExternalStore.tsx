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
		<div>
			<h1 className="text-3xl font-bold">useSyncExternalStore</h1>
			<h2 className="text-primary mt-4">
				<span className="text-black">作用: </span>订阅外部状态
			</h2>
			<div className="mt-4">
				<div>
					isOnline: <span className="text-primary">{isOnline ? "在线" : "离线"}</span>
				</div>
			</div>
		</div>
	);
}
