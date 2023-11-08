import type { GithubIssue } from "types";
import { config } from "../config";
import OctokitInitializer from "../initializers/OctokitInitializer";
import type { GetResponseTypeFromEndpointMethod } from "@octokit/types";

const owner = config.githubLDNOwner;
const repo = config.githubLDNRepo;
const octokit = OctokitInitializer.getInstance();

type CreateCommentResponseType = GetResponseTypeFromEndpointMethod<
  typeof octokit.issues.createComment
>;
/**
 * This function is used to get all the issues from the repo
 *
 * @returns {Promise<GithubIssue[]>} Github issues.
 */
export const getIssues = async (): Promise<GithubIssue[]> => {
  const issues = (await octokit.paginate(octokit.issues.listForRepo, {
    owner,
    repo,
    state: "open",
    per_page: 100,
  })) as GithubIssue[];

  return issues;
};

/**
 * This function is used to get a specific issue from the repo.
 *
 * @param issueNumber - The number of the GitHub issue.
 * @returns The issue object.
 */
export const getIssue = async (issueNumber: number): Promise<GithubIssue> => {
  const response = await octokit.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });

  return response.data as GithubIssue;
};

/**
 * Posts a comment to a given issue.
 *
 * @param {number} issueNumber - The number of the issue to which the comment will be posted.
 * @param {string} body - The content of the comment.
 * @returns {Promise<CreateCommentResponseType | false>} - Returns the result of the comment creation.
 */
export const postComment = async (
  issueNumber: number,
  body: string,
): Promise<CreateCommentResponseType | false> => {
  try {
    const response = await octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
    return response;
  } catch (e) {
    console.log(e);
    return false;
  }
};

/**
 * Adds labels to a specific issue.
 *
 * @param {number} issueNumber - The number of the issue to which the labels will be added.
 * @param {string[]} labels - An array of labels to add.
 * @returns {Promise<Object>} - Returns the result of the label addition.
 */
export const addIssueLabel = async (
  issueNumber: number,
  labels: string[],
): Promise<boolean> => {
  try {
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels,
    });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

/**
 * Removes a label from a specific issue.
 *
 * @param {number} issueNumber - The number of the issue from which the label will be removed.
 * @param {string} label - The label to remove.
 * @returns {Promise<Object>} - Returns the result of the label removal.
 */
export const removeIssueLabel = async (
  issueNumber: number,
  label: string,
): Promise<boolean> => {
  try {
    await octokit.issues.removeLabel({
      owner,
      repo,
      issue_number: issueNumber,
      name: label,
    });
    return true;
  } catch (e) {
    // If the label is not present, the request will fail.
    return false;
  }
};
