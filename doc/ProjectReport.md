# Project Report

1. Please list out changes in directions of your project if the final project is different from your original proposal (based on your stage 1 proposal submission).

- Compared to our original proposal, our application was able to achieve most of the things that we aimed to create. One of the main differences in our actual project versus the proposal was the way we visualized our data. We proposed a weighting system that included both quantity and severity to determine the shade/risk, yet we ended up only using the number of crimes in a location to determine the color.

2. Discuss what you think your application achieved or failed to achieve regarding its usefulness.

- Our application was successfully able to determine hotspots of crime through the quantity of reported crimes in a given area. This gives a good picture of how often a crime occurs, but fails to determine how dangerous/severe these crimes are as we had originally intended. To attempt to give information in this regard, we assigned risk values to each area based on the number of crimes involving highly lethal weapons, yet this system is rather primitive and only gives a narrow viewpoint of the danger levels.
- In addition, our application was successful in being able to add additional locations (latitude/longitude) to our Location table when new crimes occur. Unfortunately, due to the non-uniform placements of each area (specified by a unique area code), we were unable to link the new location to its corresponding area code. This prevents users from being able to view this addition to the schema using area codes.

3. Discuss if you changed the schema or source of the data for your application

- The only adjustment we made to the data source was removing a number of attributes that we deemed unnecessary to our application.

4. Discuss what you change to your ER diagram and/or your table implementations. What are some differences between the original design and the final design? Why? What do you think is a more suitable design? 

- We had to adjust our database schema a number of times to fit our needs of the application. In order to use the Google Maps API, we decided to split up the Primary key latLong inside the Location table, into separate attributes and add a locationId value in its stead as the Primary key which also replaced the latLong foreign key inside the Crime table. We also added the areaCode attribute to the Location table as a foreign key so we could properly assign area codes and names to each location. Without these changes, it would have made it much harder to integrate the Google Maps API and ended up being very much worth while.

5. Discuss what functionalities you added or removed. Why?

- As mentioned before, we removed the more complex idea of measuring risk through the severity of the crime. This was done because developing a complex algorithm to accurately determine the severity would have taken a lot of time, research, and testing to accomplish that we did not have.

6. Explain how you think your advanced database programs complement your application.

- To use the button to create a new location into the database, we implemented a stored procedure that also involved triggers to seamlessly execute and reach our desired result. We used a pair of triggers for before and after the insert to add null values to the associating tables to satisfy the various key constraints. This is needed as inserting values just into the location table is prohibited by our schema. Also during this stored procedure, we ran the queries necessary to return the summarized information in regards to each area code. Having this all run as a stored procedure complements our application as we are doing both reads and writes so executing everything atomically is good for combating race conditions between multiple users.

7. Each team member should describe one technical challenge that the team encountered.  This should be sufficiently detailed such that another future team could use this as helpful advice if they were to start a similar project or where to maintain your project.

- Stanley Zhu - During query production, our group came to realize that working directly on the virtual machine was not optimal. So, our group switched to using HeidiSQL which allowed for better visibility and access into the database. It made it easier to write and execute our queries, transactions and triggers.
- Brian Kim - One technical challenge our team encountered was the prospect of having a composite key holding both latitude and longitude values in our location table. This ended up causing several issues when adding additional location values to our database. So, to go about this issue, we decided to implement an auto-incrementing integer value for the primary key of the location table. This allows for simpler inserts into the location table while preserving the uniqueness of the primary key.
- Phillip Xie - One of the earliest technical challenges we face would be importing our data into the gcp. We were divided on writing an sql statement or importing individual csv files for each table. In the end, we decided it would be more efficient to create separate sheets only using a 1000 tuples specifying individual attributes. While this worked, it would prove less effective given if we tried to utilize more data in order to increase the effectiveness of our heat map.
- Yash Savalia - One challenge we faced was when we were figuring out how we would display a heatmap of the crimes on a map for our frontend. We initially ruled out the manual option of creating a map by hand and began to look for APIs that would allow us to more easily display our data in the format of a heatmap. We then had to choose between many APIs such as the Mapbox API and the Google Maps API and ultimately settled on the Google Maps API for its ease of use, look, and the ability for us to use it through the Google Cloud console.

8. Are there other things that changed comparing the final application with the original proposal?

- The only thing that changed compared to our original proposal was just the simplification of measuring severity. As mentioned before, we only used the weapon of each crime as the sole determining factor in the risk when in actuality there are a lot more different aspects and variables to consider if we want to accurately measure the risk.

9. Describe future work that you think, other than the interface, that the application can improve on

- As mentioned before, adding a more sophisticated method of measuring the risk and danger of each crime as well as visualizing that would help greatly in creating a holistic view of the LA Crime scene. 
- Adding a lot more data points would also help give a better representation of LA Crime as currently there are only 1000 crimes entered which only span a few days.
- Implementing a travel planner to visualize the different paths from A to B and determining the safest routes would be very useful for those wishing to stay safe traveling in LA.

10. Describe the final division of labor and how well you managed teamwork. 

- We divided work generally equally between us. We split it where Yash would do most of the frontend and everyone else would work on the backend queries to create the CRUD functionality and advanced queries. We made sure to include everyone in our work and reviewed each other's work, giving feedback collectively.

