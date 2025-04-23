import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Menus from "../Screens/Customer/Home/Menus/Menus";
import { Heading } from "../Reusable/Headings/Heading";
import Caroseuls from "../Reusable/Caroseuls";
import CustomerList from './Customerllist/CustomerList';
import { useLocation } from 'react-router-dom';

const Home = () => {
 
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    if (location.state?.adminRedirect) {
      alert('Your task was interrupted by an admin.');
      // You can add additional logic here to handle the interrupted task
    }
  }, [location.state]);
  
  useEffect(() => {
    const location = localStorage.getItem("location_check")
    const location_path = localStorage.getItem("location")
    const subItem = localStorage.getItem("subItem")
    const subid = localStorage.getItem("subid")
    const taskId = localStorage.getItem("taskId")
    if(location_path == '/taskdetails' && subItem  == 'Rodent Pro')
    {
      navigate("/taskdetails", {
        state: { taskId: taskId, _id: subid },
      });
      return; 
    }
    if(!location){
      navigate('/tech/home')
    }
    const isLoggedIn = localStorage.getItem("login") === 'true'; 
    if (!isLoggedIn) {
      navigate("/"); 
      return; 
    }
    localStorage.setItem("location", window.location.pathname);
  }, []);

  return (
    <div>
      <Menus title="HOME" />
      <section>
        <Heading heading="Your Ultimate Pest Control Solution Starts Here!" />
      </section>
      <section>
        <Caroseuls showDots={true} />
      </section>
      <CustomerList />
      <section></section>
    </div>
  );
};

export default Home;
