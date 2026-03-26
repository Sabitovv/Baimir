const PageContainer = ({ 
    children, 
    className = '' 
}: { 
    children: React.ReactNode; 
    className?: string 
}) => (
    <div className={`max-w-[1400px] mx-auto px-4 ${className}`}>
        {children}
    </div>
)

export default PageContainer