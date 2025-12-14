import React from 'react'
import './Home.css'
import Navbar from '../../components/Navbar/Navbar'
import hero_banner from '../../assets/hero_banner3.JPG'
import hero_title from '../../assets/hero_title3.png'
import play_icon from '../../assets/play_icon.png'
import info_icon from '../../assets/info_icon.png'
import TitleCards from '../../components/TitleCards/TitleCards'
import Footer from '../../components/Footer/Footer'

const Home = () => {
  return (
    <div className='home'>
      <Navbar/>

      <div className="hero">
        <img src={hero_banner} alt="" className='banner-img' />
        <div className="hero-caption">
            <img src={hero_title} alt="" className='caption-img' />
            <p>“Let me tell you something my friend. Hope is a dangerous thing. Hope can drive a man insane.”- Convicted of murdering his wife and her lover, Andy Dufresne tries to survive prison by clinging to hope — and befriending a fellow lifer named Red.</p>
            <div className="hero-btns">
  <a
    href="https://www.youtube.com/watch?v=PLl99DlL6b4"
    target="_blank"
    rel="noopener noreferrer"
  >
    <button className='btn'>
      <img src={play_icon} alt="" />Play
    </button>
  </a>
  <button className='btn dark-btn'>
    <img src={info_icon} alt="" />More Info
  </button>
</div>

            <TitleCards/>
        </div>
      </div>
      <div className="more-cards">
      <TitleCards title={"Blockbuster Movies"} category={"top_rated"}/>
      <TitleCards title={"Only on Movie Sphere"} category={"popular"}/>
      <TitleCards title={"Upcoming"} category={"upcoming"}/>
      <TitleCards title={"Top Picks for you"} category={"now_playing"}/>
      </div>
      <Footer/>
    </div>
  )
}

export default Home
