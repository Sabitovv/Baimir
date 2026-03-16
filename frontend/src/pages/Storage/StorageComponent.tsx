import Photo from '@/assets/storage/PhotoCat.webp'
import { useTranslation } from 'react-i18next'

const StorageComponent = () => {
    const { t } = useTranslation()

    return (
        <>
        <h2 className='font-bold text-xl my-4'>{t('storage.info.title')}</h2>
        <div className='flex gap-5 mb-14'>
            <img src={Photo}/>
            <p className='pt-2'>{t('storage.info.description')}</p>
        </div>
        </>
    );}

export default StorageComponent;
