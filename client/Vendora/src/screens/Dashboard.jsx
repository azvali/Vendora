import { useEffect } from "react";
import { backendUrl } from "../config";

function Dashboard() {

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/getUserData`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({token: token})
            })

            const data = await response.json();
            console.log(data);
        }

        fetchUserData();
    }, []);


    return(
        <>
            
        </>
    )    
}

export default Dashboard;