import React, { useEffect } from 'react'
import Home from './pages/Home/Home'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Login from './pages/Login/Login'
import Player from './pages/Player/Player'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import SearchResults from './pages/SearchResults/SearchResults';
import MovieDetails from './pages/MovieDetails/MovieDetails';
import Movies from './pages/Movies/Movies'; // ✅ Import Movies page
import TrendingTV from './pages/TrendingTV/TrendingTV';
import Genre from './pages/Genre/Genre';
import UserProfile from './pages/UserProfile/UserProfile'; // ✅ Add this
import TVDetails from './pages/TVDetails/TVDetails'; // ✅ Import this
import Reviews from './pages/Reviews/Reviews';
import ReviewDetails from './pages/ReviewDetails/ReviewDetails';
import RatingList from './pages/RatingList/RatingList';
import Navbar from './components/Navbar/Navbar'
import Recommended from './pages/Recommended/Recommended'; // ✅


const App = () => {

  const navigate = useNavigate()

  useEffect(()=>{
    onAuthStateChanged(auth, async (user)=>{
      if(user){
        console.log("Logged In");
        navigate('/')
      }else{
        console.log("Logged out");
        navigate('/login');
      }
    })
  },[])

  return (
    <div>
      <ToastContainer theme='dark'/>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/player/:id' element={<Player/>}></Route>
        <Route path="/search/:query" element={<SearchResults />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/tv" element={<TrendingTV />} />
        <Route path="/genre" element={<Genre />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/tv/:id" element={<TVDetails />} />
        <Route path="/reviews/:type/:id" element={<Reviews />} />
        <Route path="/reviewdetails/:type/:id/:reviewId" element={ReviewDetails} />
        <Route path="/rating" element={<RatingList />} />
        <Route path="/recommended" element={<Recommended />} />



      </Routes>
      
      
    </div>
  )
}

export default App