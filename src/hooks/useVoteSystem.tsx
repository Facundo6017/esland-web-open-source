import { useEffect, useState } from "preact/hooks"
import candidates from '@/data/editions-vote.json'
import type { Votes } from "@/types/votes"

interface PageInfo {
  categoria: string,
  candidatos: Candidate[]
}
  
interface Candidate {
  id: string,
  nombre: string,
  imagen: string,
  enlace?: string | null
}

const MAX_CATEGORIES = 12
const MAX_VOTES_PER_CATEGORY = 4

export const useVoteSystem = ()=>{
    const [pageInfo, setPageInfo] = useState<PageInfo>()
    const [category, setCategory] = useState(0)
    const [votes, setVotes] = useState<Votes>(Array.from({ length: MAX_CATEGORIES }, () => []))
  
    useEffect(() => {
      let item = localStorage.getItem("votes");
      let initialVotes;
      if (item !== null) {
        initialVotes = JSON.parse(item);
      } else {
        initialVotes = Array.from({ length: MAX_CATEGORIES }, () => []);
      }
      setVotes(initialVotes);
    }, []);

    useEffect(() => {
      localStorage.setItem("votes", JSON.stringify(votes));
    }, [votes]);

    const [isChanging, setIsChanging] = useState(false);

    useEffect(() => {
      setIsChanging(true)
      setPageInfo(candidates[category])
      setTimeout(() => setIsChanging(false), 500)
    }, [category])

    const setPrevCategory = () => {
      const prevCategory = category > 0 ? (category - 1) : (MAX_CATEGORIES - 1) 
      setCategory(prevCategory)
    }

    const setNextCategory = () => {
      const nextCategory = category + 1

      if (nextCategory === MAX_CATEGORIES) {
        // check if we have all the votes (4 per category)
        const missingVotes = votes.find((votesCategory) => votesCategory.length < MAX_VOTES_PER_CATEGORY)
        if (missingVotes) {
          alert('Debes votar 4 candidatos por categoría')
          return
        } 
      }
  
      setCategory(nextCategory)
    }

    const setVotesCategory = (
      { candidate }:
      {  candidate: string }
    ) => {
      const votesCategory = votes[category]
  
      // if it was already voted the item, remove it
      if (votesCategory.includes(candidate)) {
        const newVotes = votesCategory.filter((vote) => vote !== candidate)
        setVotes(prevVotes => prevVotes.with(category, newVotes))
        return
      }
  
      // check if the user has already voted for this category 4 times
      if (votesCategory.length >= 4) return
  
      // otherwise, add the vote
      const newVotes = [...votesCategory, candidate]
      setVotes(prevVotes => prevVotes.with(category, newVotes))
    }

    return {
      candidates,
      category,
      pageInfo,
      votes,
      isChanging,
      votesCategory: votes[category],
      setPrevCategory,
      setNextCategory,
      setCategory,
      setVotesCategory,
      MAX_CATEGORIES,
      MAX_VOTES_PER_CATEGORY,
    }
}
