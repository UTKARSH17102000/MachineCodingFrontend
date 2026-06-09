import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Pagination from '@/pages/questions/Pagination/Pagination';
import DarkMode from '@/pages/questions/DarkMode/DarkMode';
import ToastDemo from '@/pages/questions/Toast/ToastDemo';
import Accordion from '@/pages/questions/Accordion/Accordion';
import Tabs from '@/pages/questions/Tabs/Tabs';
import OTPInput from '@/pages/questions/OTPInput/OTPInput';
import ProgressBar from '@/pages/questions/ProgressBar/ProgressBarDemo';
import ParallelProgressBar from '@/pages/questions/ParallelProgressBar/ParallelProgressBar';
import PriceRangeSlider from '@/pages/questions/PriceRangeSlider/PriceRangeSlider';
import MultiselectDropdown from '@/pages/questions/MultiselectDropdown/MultiselectDropdown';
import SearchableDropdown from '@/pages/questions/SearchableDropdown/SearchableDropdown';
import Carousel from '@/pages/questions/Carousel/Carousel';
import InfiniteScroll from '@/pages/questions/InfiniteScroll/InfiniteScroll';
import AllPagination from '@/pages/questions/AllPagination/AllPagination';
import TicTacToe from '@/pages/questions/TicTacToe/TicTacToe';
import NestedFileSystem from '@/pages/questions/NestedFileSystem/FileTree';
import NestedComments from '@/pages/questions/NestedComments/CommentThread';
import TreeCheckbox from '@/pages/questions/TreeCheckbox/TreeCheckbox';
import ComplexSidebar from '@/pages/questions/ComplexSidebar/ComplexSidebar';
import JiraBoard from '@/pages/questions/JiraBoard/JiraBoard';
import StateManagement from '@/pages/questions/StateManagement/StateManagement';
import FileExplorer from '@/pages/questions/FileExplorer/FileExplorer';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'pagination',         element: <Pagination /> },
      { path: 'dark-mode',          element: <DarkMode /> },
      { path: 'toast',              element: <ToastDemo /> },
      { path: 'accordion',          element: <Accordion /> },
      { path: 'tabs',               element: <Tabs /> },
      { path: 'otp-input',          element: <OTPInput /> },
      { path: 'progress-bar',       element: <ProgressBar /> },
      { path: 'parallel-progress',  element: <ParallelProgressBar /> },
      { path: 'price-range-slider', element: <PriceRangeSlider /> },
      { path: 'multiselect',        element: <MultiselectDropdown /> },
      { path: 'searchable-dropdown',element: <SearchableDropdown /> },
      { path: 'carousel',           element: <Carousel /> },
      { path: 'infinite-scroll',    element: <InfiniteScroll /> },
      { path: 'all-pagination',     element: <AllPagination /> },
      { path: 'tic-tac-toe',        element: <TicTacToe /> },
      { path: 'nested-file-system', element: <NestedFileSystem /> },
      { path: 'nested-comments',    element: <NestedComments /> },
      { path: 'tree-checkbox',      element: <TreeCheckbox /> },
      { path: 'complex-sidebar',    element: <ComplexSidebar /> },
      { path: 'jira-board',         element: <JiraBoard /> },
      { path: 'state-management',   element: <StateManagement /> },
      { path: 'file-explorer',      element: <FileExplorer /> },
    ],
  },
]);

export default router;
