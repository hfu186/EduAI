export default function DiscussionTab({ discussions }) {
  const [message, setMessage] = useState("")

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4">Discussion</h2>

      <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-3">
        {discussions?.map(d => (
          <div key={d._id} className="bg-richblack-800 p-3 rounded-lg">
            <p className="font-semibold">{d.user.name}</p>
            <p className="text-richblack-200">{d.content}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 rounded-lg px-4 py-2 bg-richblack-700 text-richblack-5"
        />
        <button className="bg-yellow-50 text-black px-4 rounded-lg">
          Send
        </button>
      </div>
    </div>
  )
}
