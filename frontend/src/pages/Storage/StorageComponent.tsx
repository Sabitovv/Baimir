import Photo from '@/assets/storage/PhotoCat.webp'
import { useTranslation } from 'react-i18next'
import { EditableImage } from '@/zustand/EditableImage'

const StorageComponent = () => {
  const { t } = useTranslation()

  return (
    <>
      <h2 className='font-bold text-xl my-2'>{t('storage.info.title')}</h2>
      <div className='flex flex-col md:flex-row gap-5 mb-14 items-start'>
        <EditableImage
          imageKey="storage_info_photo"
          fallbackSrc={Photo}
          alt="storage info"
          className='w-full h-[220px] md:w-[320px] md:h-[220px] object-cover rounded-md shrink-0'
        />
        <p className='pt-1 md:pt-2 flex-1 leading-relaxed'>{t('storage.info.description')}</p>
      </div>
    </>
  )
}

export default StorageComponent;
