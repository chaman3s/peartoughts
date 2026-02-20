type InputProps={
ty:string,
alt:string,
className:string,
stl:React.CSSProperties;
plcHolder:string;
}& React.HTMLAttributes<HTMLElement>;
export default function Input({ty,alt,className,stl,plcHolder,...props}:InputProps) {
    return (
        <input type={ty} alt={alt} className={className} style={stl} placeholder={plcHolder} {...props}/>
    )
};
