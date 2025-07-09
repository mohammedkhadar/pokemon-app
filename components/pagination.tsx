import React from "react"
import {
  Pagination as PaginationPrimitive,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  totalCount?: number
  label?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  label = "",
}) => {
  if (totalPages <= 1) return null

  // Show up to 5 page numbers, with ellipsis if needed
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages)
      }
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <PaginationPrimitive aria-label={label ? `${label} pagination` : "pagination"}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            tabIndex={currentPage === 1 ? -1 : 0}
            style={{ pointerEvents: currentPage === 1 ? "none" : undefined }}
          />
        </PaginationItem>
        {pageNumbers.map((page, idx) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => onPageChange(Number(page))}
                aria-current={page === currentPage ? "page" : undefined}
                tabIndex={page === currentPage ? -1 : 0}
                style={{ pointerEvents: page === currentPage ? "none" : undefined }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            tabIndex={currentPage === totalPages ? -1 : 0}
            style={{ pointerEvents: currentPage === totalPages ? "none" : undefined }}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationPrimitive>
  )
}
