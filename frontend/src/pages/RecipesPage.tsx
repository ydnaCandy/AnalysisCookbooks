import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import Sidebar from '../components/layout/Sidebar'
import StatusBar from '../components/layout/StatusBar'
import RecipeGrid from '../components/recipes/RecipeGrid'
import RecipeModal from '../components/modals/RecipeModal'
import AdminModal from '../components/modals/AdminModal'
import { useDomains } from '../hooks/useDomains'
import { useTags } from '../hooks/useTags'
import { useRecipes } from '../hooks/useRecipes'
import type { Recipe } from '../types'

export default function RecipesPage() {
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)

  const { data: domains = [] } = useDomains()
  const { data: tags = [] } = useTags()
  const { data: recipes = [] } = useRecipes({
    domain_id: selectedDomainId ?? undefined,
    tag_id: selectedTagId ?? undefined,
  })

  const filterLabel = selectedDomainId
    ? (domains.find((d) => d.id === selectedDomainId)?.name ?? 'ALL')
    : 'ALL'

  return (
    <>
      <AppLayout
        sidebar={
          <Sidebar
            domains={domains}
            selectedDomainId={selectedDomainId}
            onSelectDomain={setSelectedDomainId}
            onOpenAdmin={() => setShowAdminModal(true)}
          />
        }
        toolbar={<></>}
        statusBar={<StatusBar count={recipes.length} filterLabel={filterLabel} />}
      >
        <RecipeGrid
          recipes={recipes}
          domains={domains}
          tags={tags}
          selectedDomainId={selectedDomainId}
          selectedTagId={selectedTagId}
          onSelectDomain={setSelectedDomainId}
          onSelectTag={setSelectedTagId}
          onClickRecipe={setSelectedRecipe}
          onClickNew={() => setShowNewModal(true)}
        />
      </AppLayout>

      {(selectedRecipe || showNewModal) && (
        <RecipeModal
          recipe={selectedRecipe}
          domains={domains}
          tags={tags}
          onClose={() => {
            setSelectedRecipe(null)
            setShowNewModal(false)
          }}
        />
      )}

      {showAdminModal && (
        <AdminModal onClose={() => setShowAdminModal(false)} />
      )}
    </>
  )
}
