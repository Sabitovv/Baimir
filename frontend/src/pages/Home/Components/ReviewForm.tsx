import { useState } from 'react'
import ScrollReveal from '@/components/animations/ScrollReveal'
import { useCreateReviewMutation } from '@/api/reviewsApi'

type ReviewFormProps = {
  isModal?: boolean
  onSuccess?: () => void
}

const ReviewForm = ({ isModal = false, onSuccess }: ReviewFormProps) => {
  const [createReview, { isLoading }] = useCreateReviewMutation()
  
  const [name, setName] = useState('')
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(5)
  // const [socialLink, setSocialLink] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    isModal

    const reviewData = {
      authorName: name,
      text: review,
      rating,
      source: 'Сайт',
      // image: photo,
    }

    try {
      await createReview(reviewData).unwrap()
      setSuccess(true)
      setName('')
      setReview('')
      setRating(5)
      // setSocialLink('')
      // removePhoto()
      
      if (isModal && onSuccess) {
        onSuccess()
      } else {
        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (err: any) {
      console.error('Ошибка при отправке отзыва:', err)
      setError(err?.data?.message || 'Произошла ошибка при отправке отзыва')
    }
  }

  const title = (
    <h2 className={`
      font-oswald font-semibold uppercase text-[#111111]
      tracking-tight
      ${isModal ? 'text-2xl md:text-3xl mb-6 md:mb-7 text-left' : 'text-3xl md:text-4xl xl:text-[54px] mb-10 md:mb-12 xl:mb-16 text-center'}
    `}>
      Оставить отзыв
    </h2>
  )

  const inputClass = `
    w-full px-4 py-3
    bg-white
    border border-[#D1D5DB]
    rounded-xl
    text-[#111111]
    placeholder:text-[#9CA3AF]
    focus:border-[#0B5FA1]
    focus:ring-2 focus:ring-[#0B5FA1]/15
    outline-none
    transition-all duration-200
  `

  const formCard = (
    <div className={`
      max-w-4xl 
      mx-auto 
      bg-white
      border border-[#E5E7EB]
      rounded-2xl 
      p-6 md:p-10 xl:p-14
      ${isModal ? 'p-6 md:p-8 xl:p-10' : ''}
    `}>
            {isModal && title}

            {success && (
              <div className="mb-6 p-4 bg-[#ECFDF3] border border-[#86EFAC] rounded-xl text-[#065F46] text-center">
                Спасибо за ваш отзыв! Он будет проверен и опубликован.
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-7">
              
              <div className="grid gap-6 md:gap-8">
                <div>
                  <label htmlFor="name" className="
                    block text-sm font-medium text-[#374151] mb-2
                  ">
                    Ваше имя *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Иван Иванов"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="review" className="
                  block text-sm font-medium text-[#374151] mb-2
                ">
                  Ваш отзыв *
                </label>
                <textarea
                  id="review"
                  required
                  rows={5}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className={`${inputClass} resize-none min-h-[140px]`}
                  placeholder="Поделитесь вашими впечатлениями о работе компании..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-3">
                  Оценка *
                </label>
                <div className="flex items-center gap-1 flex-wrap">
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
                            ? 'text-[#F59E0B]' 
                            : 'text-gray-300 hover:text-[#FBBF24]'
                          }
                        `}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="ml-2 md:ml-3 text-sm font-medium text-[#6B7280]">
                    {rating === 5 && 'Отлично'}
                    {rating === 4 && 'Хорошо'}
                    {rating === 3 && 'Нормально'}
                    {rating === 2 && 'Плохо'}
                    {rating === 1 && 'Очень плохо'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    min-w-[220px] px-8 py-3 
                    bg-[#F58322] text-white 
                    font-semibold 
                    text-base tracking-wide
                    rounded-xl 
                    hover:bg-[#DB741F] 
                    transition-all duration-200
                    disabled:opacity-70 disabled:cursor-not-allowed
                    disabled:hover:bg-[#F58322]
                    focus:ring-2 focus:ring-[#F58322]/30 focus:ring-offset-2
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
  )

  if (isModal) {
    return (
      <div className="px-4 py-2 md:px-6 md:py-4">
        {formCard}
      </div>
    )
  }

  return (
    <section className="py-16 md:py-20 xl:py-24 bg-[#F5F5F5]">
      <div className="max-w-[1920px] mx-auto px-6 md:px-[80px] xl:px-[250px]">
        <ScrollReveal>{title}</ScrollReveal>
        <ScrollReveal delay={0.1}>{formCard}</ScrollReveal>
      </div>
    </section>
  )
}

export default ReviewForm
