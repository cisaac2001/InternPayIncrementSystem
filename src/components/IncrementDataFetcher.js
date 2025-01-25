import React, { useState } from "react";

const IncrementButton = () => {
    const [data, setData] = useState(null);

    const fetchIncrementData = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/increment-data");
            const result = await response.json();

            if (response.ok) {
                console.log(result.data); // View increment data
                setData(result.data);
            } else {
                console.error("Error:", result.message);
            }
        } catch (error) {
            console.error("Error fetching increment data:", error);
        }
    };

    return (
        <div>
            <button onClick={fetchIncrementData}>Fetch Increment Data</button>
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
};

export default IncrementButton;
