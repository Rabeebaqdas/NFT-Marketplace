import { BrowserRouter,Route,Routes } from 'react-router-dom';
import Home from "./pages/Home";
import MyNFT from './pages/MyNFT';
import NotListedNFT from './pages/NotListedNFT';
import MintNFT from './pages/MintNFT';
import BuyTokens from './pages/BuyTokens';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { NotListedDetails } from './pages/NotListedDetails';
import Explore from './pages/Explore';
import ListedDetails from './pages/ListedDetails';
import NftDetailsBuy from './pages/NftDetailsBuy';

function App() {
  return (
    <div>
        <BrowserRouter>
        <Navbar />
       <Routes>
          <Route exact path='/' element={<Home />} />          
         <Route exact path='/explore' element={<Explore />} /> 
         <Route exact path='/explore/:id' element={<NftDetailsBuy />} />          
         <Route path='/mynft' element={<MyNFT />} />
         <Route path='/mynft/:id' element={<ListedDetails />} />
         <Route path='/notlistednft' element={<NotListedNFT />} />
         <Route path='/notlistednft/:id' element={<NotListedDetails />} />
         <Route path='/mintnft' element={<MintNFT />} />
         <Route path='/buytokens' element={<BuyTokens />} />

       </Routes>
       <Footer />

    </BrowserRouter>
       </div>
  );
}

export default App;
