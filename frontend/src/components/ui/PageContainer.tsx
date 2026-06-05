const PageContainer = ({ 
    children, 
    className = '' 
}: { 
    children: React.ReactNode; 
    className?: string 
}) => (
    <div className={`mx-auto w-full max-w-[1280px] px-4 2xl:max-w-[1400px] ${className}`}>
        {children}
    </div>
)

export default PageContainer
