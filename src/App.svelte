<script>
	import { Router, Link, Route } from "svelte-routing";
	import Play from "./Play.svelte";
	export let url = "";

</script>
<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		font-family: serif;
    color: white;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
	p {
		font-family: serif;
    	color: white;
		font-size: 18px;
		font-weight: 100;
		margin:0 150px;
		text-align: left;

	}
	ul{
		margin:0 130px;
		text-align: left;
		font-family: serif;
    	color: white;
		font-size: 17px;
	}
	.header{
		background-color: #000;
    	background: linear-gradient(30deg,#000,transparent)
	}
	button{
		background: white;
    color: red;
    font-family: cursive;
	cursor: pointer;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
<Router url="{url}">
<main>
	<Route path='/'> 
		<div class="header">
			<h1>Find Me the QUEEN !</h1>
			<p>
				Our Story is set in the planet of Lengaburu…in the distant
				distant galaxy of Tara B. After the recent war with neighbouring
				planet Falicornia, King Shan has exiled the Queen of Falicornia
				for 15 years.
				Queen Al Falcone is now in hiding. But if King Shan can find
				her before the years are up, she will be exiled for another 15
				years….
			</p>
			<br/>
			<p>
				King Shan has received intelligence that Queen Al Falcone is in hiding in one of these 6 planets - DonLon, Enchai, Jebing,
				Sapir, Lerbin & Pingasor. However he has limited resources at his disposal & can send his army to only 4 of these
				planets. 
			</p>
			<br/>
			<p>
				Your Task is to help King Shan to find Queen Al Falcone 
			</p>
			<br/>
			<ul>
				<span style="text-decoration:1px solid underline">Instructions:</span>
				<li>select 4 planets to search (out of the total 6) </li>
				<li>select which space vehicles to send to these planets.  </li>
				<li>All have different ranges (maximum distance it can travel). If the range for a vehicle
					is lesser than the distance to the planet, it cannot be chosen for going to the planet.</li>
				<li>see how much time it will take for the vehicles to reach their targets </li>
				<li>Result will based on Luck as we randomly assign a planet to Al Falcone everytime you play</li>
		
			</ul>
			<br/>
				<Link to="/find">
					<button >
						Find Queen Al Falcone
					</button>
				</Link>		
			</div>
		</Route>
		<Route path='/find' component="{Play}"/>

</main>
</Router>
