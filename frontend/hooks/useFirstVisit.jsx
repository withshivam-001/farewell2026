import { useState, useEffect } from 'react'

export default function useFirstVisit(key = 'page') {
  const [isFirst, setIsFirst] = useState(true)

  useEffect(() => {
    const visited = sessionStorage.getItem(key)
    if (visited) {
      setIsFirst(false)
    } else {
      sessionStorage.setItem(key, 'true')
    }
  }, [key])

  return isFirst
}