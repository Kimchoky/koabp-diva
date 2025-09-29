/**
 * @param vertical 세로 선을 그린다. 이 컴포넌트를 감싼 컨테이너는 flex 속성을 가져야 올바르게 보인다.
 * @param className css classes
 */
export default function Divider({ vertical, className }: { vertical?: boolean, className?: string }) {


  return vertical ? (
    <div
      className={`w-[1px] self-stretch bg-border-light dark:bg-border-dark ml-1 mr-1 ${className}`}
    />
  ) : (
    <div
      className={`w-full h-[1px] bg-border-light dark:bg-border-dark mt-2 mb-2 ${className}`}
    />
  )

}