Bug #97374: Total app memory availability across cluster

* CC API call to `/usage` returns the following values:

		{
		   "placement_zones":[
		      {
		         "name":"default",
		         "dea_ids":[
		            "0-e0d2add5034343ff9a8ecf2c1c5958af"
		         ],
		         "total_allocated":256,
		         "total_used":21,
		         "total_available":1344,
		         "total_physical":1600
		      }
		   ],
		   "availability_zones":[
		      {
		         "name":"default",
		         "dea_ids":[
		            "0-e0d2add5034343ff9a8ecf2c1c5958af"
		         ],
		         "total_allocated":256,
		         "total_used":21,
		         "total_available":1344,
		         "total_physical":1600
		      }
		   ],
		   "cluster":{
		      "total_allocated":256,
		      "total_used":21,
		      "total_available":1344,
		      "total_physical":1600,
		      "total_assigned":2048
		   },
		   "deas":[
		      {
		         "total_allocated":256,
		         "total_used":21,
		         "dea_id":"0-e0d2add5034343ff9a8ecf2c1c5958af",
		         "dea_ip":"192.168.68.184",
		         "total_available":1344,
		         "total_physical":1600
		      }
		   ],
		   "usage":{
		      "mem":21504
		   },
		   "allocated":{
		      "mem":262144
		   }
		}
		
* Web UI for viewing these stats and their relationships to each other exist in the console at `/index.html#usage`

* Data displayed in the Web UI includes cluster-wide memory usage, as well as break down of usage by DEA, by Placement Zone, and by Availability Zone. 

* `total_available` represents the amount of memory reported by the system as available, and may not be the same as the `total_physical` if the `memory_max_percent` value is set to something other than 100.

* The top level `allocated` and `usage` values are in KB, while all other values are in MB.