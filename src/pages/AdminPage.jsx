import {link} from 'react-router-dom'
export default function AdminPage(){
  return (
    <div>
      <h1>Admin Area</h1>
        <ul>
          <li>
            <link to= "/admin/instructor-applications"> Instructor appication </link>
          </li>
        </ul>
      <link to = "/">Back</link>
    </div>
  )
}