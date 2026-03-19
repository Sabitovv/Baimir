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
  const [socialLink, setSocialLink] = useState('')
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
      profileUrl: socialLink || undefined,
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
      setSocialLink('')
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
          ">
            Оставить отзыв
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="
            max-w-4xl 
            mx-auto 
            bg-white 
            rounded-2xl 
            shadow-[0_10px_40px_rgba(0,0,0,0.06)]
            p-6 md:p-10 xl:p-14
          ">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center">
                Спасибо за ваш отзыв! Он будет проверен и опубликован.
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <label htmlFor="name" className="
                    block text-sm font-semibold text-[#111111] mb-2
                    tracking-wide
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
                      w-full px-5 py-3.5 
                      border-2 border-gray-200 
                      rounded-xl 
                      text-[#111111]
                      placeholder:text-gray-400
                      focus:border-[#F58322] 
                      focus:ring-4 focus:ring-[#F58322]/10
                      outline-none 
                      transition-all duration-300
                      hover:border-gray-300
                    "
                    placeholder="Иван Иванов"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="
                    block text-sm font-semibold text-[#111111] mb-2
                    tracking-wide
                  ">
                    Краткое описание
                  </label>
                  <input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="
                      w-full px-5 py-3.5 
                      border-2 border-gray-200 
                      rounded-xl 
                      text-[#111111]
                      placeholder:text-gray-400
                      focus:border-[#F58322] 
                      focus:ring-4 focus:ring-[#F58322]/10
                      outline-none 
                      transition-all duration-300
                      hover:border-gray-300
                    "
                    placeholder="Директор компании"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-2 tracking-wide">
                  Оценка *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                    >
                      <span className={star <= rating ? 'text-[#F58322]' : 'text-gray-300'}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review" className="
                  block text-sm font-semibold text-[#111111] mb-2
                  tracking-wide
                ">
                  Ваш отзыв *
                </label>
                <textarea
                  id="review"
                  required
                  rows={6}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="
                    w-full px-5 py-4 
                    border-2 border-gray-200 
                    rounded-xl 
                    text-[#111111]
                    placeholder:text-gray-400
                    focus:border-[#F58322] 
                    focus:ring-4 focus:ring-[#F58322]/10
                    outline-none 
                    transition-all duration-300
                    hover:border-gray-300
                    resize-none
                  "
                  placeholder="Поделитесь вашими впечатлениями о работе компании..."
                />
              </div>

              <div>
                <label htmlFor="socialLink" className="
                  block text-sm font-semibold text-[#111111] mb-2
                  tracking-wide
                ">
                  Ссылка на соцсети
                </label>
                <input
                  id="socialLink"
                  type="url"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  className="
                    w-full px-5 py-3.5 
                    border-2 border-gray-200 
                    rounded-xl 
                    text-[#111111]
                    placeholder:text-gray-400
                    focus:border-[#F58322] 
                    focus:ring-4 focus:ring-[#F58322]/10
                    outline-none 
                    transition-all duration-300
                    hover:border-gray-300
                  "
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="
                p-6 
                bg-[#FAFAFA] 
                rounded-xl 
                border-2 border-dashed border-gray-200
                hover:border-[#F58322]/50
                transition-colors duration-300
              ">
                <label className="block text-sm font-semibold text-[#111111] mb-4 tracking-wide">
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
                      px-6 py-3 
                      bg-white 
                      border-2 border-[#F58322] 
                      rounded-xl 
                      text-sm font-semibold text-[#F58322]
                      hover:bg-[#F58322] hover:text-white
                      transition-all duration-300
                      shadow-sm hover:shadow-md
                    "
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          w-20 h-20 
                          object-cover 
                          rounded-xl 
                          border-2 border-gray-200
                          shadow-sm
                        "
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="
                          absolute -top-2 -right-2 
                          bg-red-500 text-white 
                          rounded-full w-7 h-7 
                          flex items-center justify-center
                          hover:bg-red-600 
                          transition-colors
                          shadow-md
                          opacity-0 group-hover:opacity-100
                        "
                        title="Удалить"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    px-10 py-4 
                    bg-[#F58322] text-white 
                    font-oswald font-medium uppercase 
                    text-lg tracking-wider
                    rounded-xl 
                    hover:bg-[#DB741F] 
                    transition-all duration-300
                    shadow-lg hover:shadow-xl
                    hover:scale-[1.02]
                    disabled:opacity-70 disabled:cursor-not-allowed
                    disabled:hover:scale-100
                    focus:ring-4 focus:ring-[#F58322]/30
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
