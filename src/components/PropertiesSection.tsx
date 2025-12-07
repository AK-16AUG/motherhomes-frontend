import React from "react";
import { useNavigate } from "react-router-dom";
interface City {
  name: string;
  properties: number;
  image: string;
}

const PropertiesSection: React.FC = () => {
  const navigate = useNavigate();

  const cities: City[] = [
    {
      name: "Ghaziabad",
      properties: 10,
      image: "https://i.ytimg.com/vi/-pTinhxMwdw/maxresdefault.jpg",
    },
    {
      name: "Noida",
      properties: 8,
      image:
        "https://i.ytimg.com/vi/ehMDI6S4WrM/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAaz9tfcYpjXQwE9RV32KAEk7gzAw",
    },
    {
      name: "Delhi",
      properties: 6,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQPeb8oowKAnqsuEaAOwn7MKWdmD_biR6KXA&s",
    },
    {
      name: "Greater Noida",
      properties: 5,
      image:
        "https://static.india.com/wp-content/uploads/2023/08/Greater-Noida-Freepik.jpg",
    },
    {
      name: "Gurugram",
      properties: 3,
      image:
        "https://i.ytimg.com/vi/JaQVOX3inNY/maxresdefault.jpg",
    },
    {
      name: "Dehradun",
      properties: 5,
      image:
        "https://i.ytimg.com/vi/hE1hWY9ROI0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCwE1PtBwiv_QW4wjsuQWU37OtcbA",
    },
    {
      name: "Varanasi",
      properties: 4,
      image:
        "https://upload.wikimedia.org/wikipedia/commons/0/04/Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg",
    }
  ];

  const handleCardClick = (cityName: string) => {
    navigate(`/viewlisting?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <div className="bg-white py-12 px-4 sm:px-6 lg:px-8 font-[montserrat]">
      <div className="max-w-7xl mx-auto flex flex-col justify-evenly">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Discover <span className="text-yellow-400">Homes</span> Across Top Cities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore PGs and flats in Ghaziabad, Noida, Delhi, and beyond — all
            handpicked to match your comfort and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleCardClick(city.name)}
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-48 sm:h-60 md:h-72 lg:h-80 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-white font-semibold text-2xl mb-0.5 bg-black/70 rounded-2xl text-center px-2 ">
                  {city.name}
                </h3>
                <p className="text-black rounded-2xl px-2 text-center text-sm bg-amber-100">
                  {city.properties} properties
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertiesSection;
