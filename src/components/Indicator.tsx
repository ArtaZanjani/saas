import { ArrowLeft2 } from "iconsax-reactjs";

const Indicator = ({ title, className }: { title: string; className?: string }) => {
  return (
    <div className={`flex items-center max-xl:hidden ${className}`}>
      <ArrowLeft2 className="size-6 tablet:size-7" variant="Bold" />

      <p className="font-medium">{title}</p>
    </div>
  );
};

export default Indicator;
