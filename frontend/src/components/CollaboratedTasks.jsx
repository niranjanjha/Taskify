import { useState, useMemo } from "react"
import { useOutletContext } from "react-router-dom"
import { Users, Filter, Phone } from "lucide-react"
import TaskItem from "../components/TaskItem"
import CustomDropdown from "./CustomDropdown";
import { SORT_OPTIONS, CT_CLASSES } from "../assets/dummy"
import VideoCall from "./VideoCall";

const CollaboratedTasks = () => {
  const { tasks, refreshTasks, user } = useOutletContext()
  const [sortBy, setSortBy] = useState("newest")
  const [activeCall, setActiveCall] = useState(null);

  // Filter tasks that are assigned to the current user but not owned by them
  const collaboratedTasks = useMemo(() => {
    return tasks.filter(task => {
      // Check if current user is assigned to the task
      const isAssigned = task.assignedTo && task.assignedTo.some(assignment => 
        assignment.user && assignment.user._id === (user?.id || localStorage.getItem('userId'))
      );
      
      // Check if current user is the owner of the task
      const isOwner = task.owner === (user?.id || localStorage.getItem('userId'));
      
      // Return tasks where user is assigned but not the owner
      return isAssigned && !isOwner;
    });
  }, [tasks, user]);

  const sortedCollaboratedTasks = useMemo(() => {
    return [...collaboratedTasks].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt)
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt)
        case "priority": {
          const order = { high: 3, medium: 2, low: 1 }
          return order[b.priority?.toLowerCase()] - order[a.priority?.toLowerCase()]
        }
        default:
          return 0
      }
    })
  }, [collaboratedTasks, sortBy])

  const startVideoCall = (task) => {
    setActiveCall(task);
  };

  const endVideoCall = () => {
    setActiveCall(null);
  };

  return (
    <div className={CT_CLASSES.page}>
      {/* Header */ }
      <div className={CT_CLASSES.header}>
        <div className={CT_CLASSES.titleWrapper}>
          <h1 className={CT_CLASSES.title}>
            <Users className="text-purple-500 w-5 h-5 md:w-6 md:h-6" />
            <span className="truncate">Collaborated Tasks</span>
          </h1>
          <p className={CT_CLASSES.subtitle}>
            {sortedCollaboratedTasks.length} task{sortedCollaboratedTasks.length !== 1 && "s"} assigned to you by others
          </p>
        </div>

        {/* Sort Controls */ }
        <div className={CT_CLASSES.sortContainer}>
          <div className={CT_CLASSES.sortBox}>
            <div className={CT_CLASSES.filterLabel}>
              <Filter className="w-4 h-4 text-purple-500" />
              <span className="text-xs md:text-sm">Sort by:</span>
            </div>

            {/* Mobile Dropdown */ }
            <CustomDropdown
              options={SORT_OPTIONS.map(opt => ({ value: opt.id, label: `${opt.label} ${opt.id === 'newest' ? 'First' : ''}` }))}
              value={sortBy}
              onChange={setSortBy}
              className="md:hidden"
            />

            {/* Desktop Buttons */ }
            <div className={CT_CLASSES.btnGroup}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={[
                    CT_CLASSES.btnBase,
                    sortBy === opt.id ? CT_CLASSES.btnActive : CT_CLASSES.btnInactive
                  ].join(" ")}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task List */ }
      <div className={CT_CLASSES.list}>
        {sortedCollaboratedTasks.length === 0 ? (
          <div className={CT_CLASSES.emptyState}>
            <div className={CT_CLASSES.emptyIconWrapper}>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
            </div>
            <h3 className={CT_CLASSES.emptyTitle}>No collaborated tasks yet!</h3>
            <p className={CT_CLASSES.emptyText}>Tasks assigned to you by others will appear here</p>
          </div>
        ) : (
          sortedCollaboratedTasks.map(task => (
            <div key={task._id || task.id} className="relative">
              <TaskItem
                task={task}
                onRefresh={refreshTasks}
                showCompleteCheckbox={true}
                className="opacity-90 hover:opacity-100 transition-opacity text-sm md:text-base"
                currentUser={user}
              />
              {/* Connect button for video call */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => startVideoCall(task)}
                  className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-full text-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Connect</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Video Call Modal */}
      {activeCall && (
        <VideoCall
          taskId={activeCall._id}
          taskTitle={activeCall.title}
          onClose={endVideoCall}
          currentUser={user}
        />
      )}
    </div>
  )
}

export default CollaboratedTasks