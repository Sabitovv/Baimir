import Photo from '@/assets/storage/PhotoCat.webp'
import { useTranslation } from 'react-i18next'
import { EditableImage } from '@/zustand/EditableImage'

const StorageComponent = () => {
    const { t } = useTranslation()

    return (
        <>
        <h2 className='font-bold text-xl my-4'>{t('storage.info.title')}</h2>
        <div className='flex gap-5 mb-14'>
            <EditableImage imageKey="storage_info_photo" fallbackSrc={Photo} alt="storage info" />
            <p className='pt-2'>{t('storage.info.description')}</p>
        </div>
        </>
    );}

export default StorageComponent;
