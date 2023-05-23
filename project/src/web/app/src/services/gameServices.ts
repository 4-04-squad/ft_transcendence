import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL;


/**
 * @description Get all games
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getGames = () => {
  return axios.get(`${API_URL}/games`, {
    withCredentials: true,
  });
};

/**
 * @description Get games by user
 * @param userId 
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getGamesByUser = (userId: number) => {
    return axios.get(`${API_URL}/games/${userId}/user`, {
        withCredentials: true,
    });
};	

/**
 * @description Get game by id
 * @param gameId
 * @returns {Promise<AxiosResponse<any>>}
 */
export const getGameById = (gameId: number) => {
  return axios.get(`${API_URL}/games/${gameId}`, {
    withCredentials: true,
  });
};

export const getStatsByUser = (userId: string) => {
  return axios.get(`${API_URL}/games/${userId}/statistics`, {
    withCredentials: true,
  });
};

/**
 * @description Join a game
 * @returns {Promise<AxiosResponse<any>>}
 * @param gameId
 */
export const joinGame = (gameId: number) => {
  return axios.post(
    `${API_URL}/games/join`,
    { gameId },
    {
      withCredentials: true,
    }
  );
};

/**
 * @description Create a game
 * @returns {Promise<AxiosResponse<any>>}
 */
export const createGame = () => {
	  return axios.post(`${API_URL}/games/create`, {}, { withCredentials: true });
};

/**
 * @description End a game
 * @returns {Promise<AxiosResponse<any>>}
 */
export const endGame = (gameId: number, data: []) => {
    return axios.patch(`${API_URL}/games/${gameId}/end`, {data}, { withCredentials: true });
}