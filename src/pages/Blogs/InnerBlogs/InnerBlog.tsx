import PageContainer from '@/components/ui/PageContainer'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import img from '@/assets/lazerStanok.png'
import { useParams } from 'react-router-dom'

// type BlogInnerProps = {
//   image: string
//   title: string
// }

const InnerBlog = () => {
  const { id } = useParams()
  return (
    <>
      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 mt-16">

          <aside className="hidden lg:block space-y-6">
            <CategoriesMenu />
          </aside>

          <article className="max-w-[900px]">

            <h1 className="font-oswald font-bold text-3xl md:text-4xl xl:text-5xl uppercase mb-6">
              {id}
            </h1>

            <img
              src={img}
              className="w-full max-h-[420px] object-cover rounded mb-6"
            />

            <h3 className="font-oswald font-bold text-xl mb-4">
              {id}
            </h3>

            <p className="text-gray-700 leading-relaxed mb-6">
              Внедрение токарного станка с ЧПУ часто воспринимается как просто замена
              старого оборудования на новое. Но на практике это стратегическое решение,
              которое перестраивает всю логику цеха.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              На примере реального кейса компании «ТехноДеталь» из Санкт-Петербурга
              разберём, как переход на современное оборудование позволил не просто
              ускорить, а удвоить выпуск деталей.
            </p>

          </article>
        </div>
      </PageContainer>
    </>
  )
}

export default InnerBlog
