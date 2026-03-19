import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import ScrollReveal from '@/components/animations/ScrollReveal'
import { useCreateReviewMutation } from '@/api/reviewsApi'

const ReviewForm = () => {
  const { i18n } = useTranslation()
  const [createReview, { isLoading }] = useCreateReviewMutation()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(5)
  // const [socialLink, setSocialLink] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const previewUrl = URL.createObjectURL(file)
      setPhotoPreview(previewUrl)
    }
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const lang = i18n.language === 'kk' ? 'kz' : i18n.language

    const reviewData = {
      authorName: name,
      authorDescription: {
        ru: description,
        [lang]: description,
      },
      text: {
        ru: review,
        [lang]: review,
      },
      rating,
      // profileUrl: socialLink || undefined,
      sortOrder: 0,
      image: photo,
    }

    try {
      await createReview(reviewData).unwrap()
      setSuccess(true)
      setName('')
      setDescription('')
      setReview('')
      setRating(5)
      // setSocialLink('')
      removePhoto()
      
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      console.error('Ошибка при отправке отзыва:', err)
      setError(err?.data?.message || 'Произошла ошибка при отправке отзыва')
    }
  }

  return (
    <section className="py-16 md:py-20 xl:py-24 bg-[#F5F5F5]">
      <div className="max-w-[1920px] mx-auto px-6 md:px-[80px] xl:px-[250px]">
        
        <ScrollReveal>
          <h2 className="
            font-oswald font-semibold uppercase text-[#111111]
            text-3xl md:text-4xl xl:text-[54px]
            mb-10 md:mb-12 xl:mb-16
            tracking-tight
            text-center
          ">
            Оставить отзыв
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="
            max-w-4xl 
            mx-auto 
            bg-white/60 backdrop-blur-sm
            border border-white/80
            rounded-2xl 
            shadow-[0_4px_30px_rgba(0,0,0,0.08)]
            p-6 md:p-10 xl:p-14
          ">
            {success && (
              <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl text-[#111111] text-center shadow-sm">
                Спасибо за ваш отзыв! Он будет проверен и опубликован.
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl text-red-600 text-center shadow-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label htmlFor="name" className="
                    block text-sm font-medium text-[#111111]/70 mb-2
                  ">
                    Ваше имя *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="
                      w-full px-4 py-3 
                      bg-white/50 backdrop-blur-sm
                      border border-white/50
                      rounded-lg 
                      text-[#111111]
                      placeholder:text-gray-400
                      focus:border-[#F58322]/60 
                      focus:ring-2 focus:ring-[#F58322]/10
                      outline-none 
                      transition-all duration-300
                      hover:border-[#F58322]/40
                    "
                    placeholder="Иван Иванов"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="
                    block text-sm font-medium text-[#111111]/70 mb-2
                  ">
                    Краткое описание
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="
                      w-full px-4 py-3 
                      bg-white/50 backdrop-blur-sm
                      border border-white/50
                      rounded-lg 
                      text-[#111111]
                      placeholder:text-gray-400
                      focus:border-[#F58322]/60 
                      focus:ring-2 focus:ring-[#F58322]/10
                      outline-none 
                      transition-all duration-300
                      hover:border-[#F58322]/40
                    "
                    placeholder="Директор компании"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111]/70 mb-3">
                  Оценка *
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-3xl transition-all duration-200 hover:scale-110 focus:outline-none cursor-pointer p-1"
                    >
                      <span 
                        className={`
                          transition-colors duration-200
                          ${star <= rating 
                            ? 'text-[#F58322]/80' 
                            : 'text-gray-300 hover:text-[#F58322]/50'
                          }
                        `}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="ml-3 text-sm font-medium text-[#111111]/50">
                    {rating === 5 && 'Отлично'}
                    {rating === 4 && 'Хорошо'}
                    {rating === 3 && 'Нормально'}
                    {rating === 2 && 'Плохо'}
                    {rating === 1 && 'Очень плохо'}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="review" className="
                  block text-sm font-medium text-[#111111]/70 mb-2
                ">
                  Ваш отзыв *
                </label>
                <textarea
                  id="review"
                  required
                  rows={5}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="
                    w-full px-4 py-3 
                    bg-white/50 backdrop-blur-sm
                    border border-white/50
                    rounded-lg 
                    text-[#111111]
                    placeholder:text-gray-400
                    focus:border-[#F58322]/60 
                    focus:ring-2 focus:ring-[#F58322]/10
                    outline-none 
                    transition-all duration-300
                    hover:border-[#F58322]/40
                    resize-none
                  "
                  placeholder="Поделитесь вашими впечатлениями о работе компании..."
                />
              </div>
{/* 
              <div>
                <label htmlFor="socialLink" className="
                  block text-sm font-medium text-[#111111]/70 mb-2
                ">
                  Ссылка на соцсети
                </label>
                <input
                  id="socialLink"
                  type="url"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  className="
                    w-full px-4 py-3 
                    bg-white/50 backdrop-blur-sm
                    border border-white/50
                    rounded-lg 
                    text-[#111111]
                    placeholder:text-gray-400
                    focus:border-[#F58322]/60 
                    focus:ring-2 focus:ring-[#F58322]/10
                    outline-none 
                    transition-all duration-300
                    hover:border-[#F58322]/40
                  "
                  placeholder="https://instagram.com/..."
                />
              </div> */}

              <div className="
                p-5 
                bg-white/30
                rounded-lg 
                border border-white/30
              ">
                <label className="block text-sm font-medium text-[#111111]/70 mb-4">
                  Загрузить фото (необязательно)
                </label>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  
                  <label
                    htmlFor="photo-upload"
                    className="
                      cursor-pointer 
                      inline-flex items-center justify-center 
                      px-5 py-2.5 
                      bg-white/70
                      border border-[#F58322]/40
                      rounded-lg 
                      text-sm font-medium text-[#111111]/70
                      hover:bg-white/90
                      transition-all duration-300
                    "
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Выбрать фото
                  </label>

                  {photoPreview && (
                    <div className="relative group">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="
                          w-16 h-16 
                          object-cover 
                          rounded-lg 
                          border border-white/50
                        "
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="
                          absolute -top-2 -right-2 
                          bg-[#111111]/70 text-white 
                          rounded-full w-6 h-6 
                          flex items-center justify-center
                          hover:bg-[#111111] 
                          transition-colors
                          opacity-0 group-hover:opacity-100
                        "
                        title="Удалить"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    px-8 py-3 
                    bg-white/70 text-[#111111] 
                    font-medium 
                    text-base tracking-wide
                    rounded-lg 
                    hover:bg-white 
                    transition-all duration-300
                    shadow-sm hover:shadow-md
                    disabled:opacity-70 disabled:cursor-not-allowed
                    disabled:hover:bg-white/70
                    focus:ring-2 focus:ring-[#F58322]/30
                    outline-none
                  "
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Отправка...
                    </span>
                  ) : (
                    'Отправить отзыв'
                  )}
                </button>
              </div>

            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default ReviewForm
