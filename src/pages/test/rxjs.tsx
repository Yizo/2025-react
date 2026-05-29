import { asyncScheduler, observeOn, of } from 'rxjs';

export default function Rxjs() {
  of(1, 2, 3)
    .pipe(
      observeOn(asyncScheduler) // 通知变为异步
    )
    .subscribe((v) => console.log(v));

  return (
    <div className="bg-black text-white p-4 w-full h-screen">
      <h1 className="text-2xl font-bold">Rxjs</h1>
    </div>
  );
}
