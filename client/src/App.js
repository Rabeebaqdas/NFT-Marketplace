import { BrowserRouter,Route,Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from "./pages/Home";
import MyNFT from './pages/MyNFT';
import SellNft from "./pages/ListNft";
import NotListedNFT from './pages/NotListedNFT';
import MintNFT from './pages/MintNFT';
import BuyTokens from './pages/BuyTokens';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

function App() {
  return (
    <div>
        <BrowserRouter>
        <Navbar />
       <Routes>
         <Route exact path='/' element={<Home />} />         
         <Route path='/listnft' element={<SellNft />} />
         <Route path='/mynft' element={<MyNFT />} />
         <Route path='/mintednft' element={<NotListedNFT />} />
         <Route path='/mintnft' element={<MintNFT />} />
         <Route path='/buytokens' element={<BuyTokens />} />

       </Routes>
       <Footer />

    </BrowserRouter>
       </div>
  );
}

export default App;
