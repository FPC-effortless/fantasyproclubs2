"use client"

import { ArrowLeft, FileText, AlertTriangle, DollarSign, Calendar, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function CompetitionRulesPage() {
  return (
    <div className="min-h-screen bg-[#085b2a]">
      {/* Header */}
      <div className="relative bg-green-900 bg-[url('/pattern.svg')] bg-cover bg-center min-h-[120px]">
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/competitions" className="text-white hover:text-gray-300">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-lg font-bold text-white">Competition Rules</h1>
          </div>
          <p className="text-gray-200 text-sm">Official rules and regulations for all competitions</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6 pb-8 max-w-4xl mx-auto">
        {/* Introduction */}
        <div className="bg-[#222] rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Important Notice</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                All participants must read and agree to these rules before participating in any competition. 
                Violations may result in fines, suspensions, or disqualification. All penalties are enforced strictly.
              </p>
            </div>
          </div>
        </div>

        {/* 1. GENERAL RULES */}
        <div className="bg-[#222] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">1. GENERAL RULES</h2>
          </div>

          {/* 1.1 Player & Team Verification */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">1.1 Player & Team Verification</h3>
            <div className="space-y-4">
              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">1.1.1 Squad Size Limit</h4>
                <p className="text-gray-300 text-sm mb-2">Maximum squad size is 16 players, including the manager.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span><strong>Penalty:</strong> Exceeding this after a warning will result in a team reset.</span>
                </div>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">1.1.2 Player Registration</h4>
                <p className="text-gray-300 text-sm mb-2">All players must be officially signed to the club, with registration to include a valid PSN ID or Xbox Gamertag.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span><strong>Penalty:</strong> Unsigned players will receive a season ban, and the club will be fined ₦30,000.</span>
                </div>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">1.1.3 Minimum Players</h4>
                <p className="text-gray-300 text-sm mb-2">Teams must have a minimum of 8 outfield players on match day.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span><strong>Strike System:</strong> Failure to meet this requirement will result in a strike. After 3 strikes, the team will be handed a 1-0 default loss.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1.2 Match Setup & Game Requirements */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">1.2 Match Setup & Game Requirements</h3>
            <div className="space-y-4">
              <div className="bg-[#111] rounded-lg p-4">
                                 <h4 className="font-medium text-white mb-2">1.2.1 Team Configuration</h4>
                 <p className="text-gray-300 text-sm mb-2">All teams must use a fresh team with 80-rated AI and club facilities capped at $1 million for competitive matches.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span><strong>Penalty:</strong> ₦5,000 fine and a default loss for using ranked teams or exceeding facility limits.</span>
                </div>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">1.2.2 Server & Location Requirements</h4>
                <p className="text-gray-300 text-sm">All matches must be played on the Lagos server, and each team&apos;s captain must be based in Nigeria.</p>
              </div>
            </div>
          </div>

          {/* 1.3 In-Game Conduct & Resets */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">1.3 In-Game Conduct & Resets</h3>
            <div className="space-y-4">
              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">1.3.1 Early Match Quits</h4>
                <p className="text-gray-300 text-sm mb-2">Matches may only be quit early if:</p>
                <ul className="text-gray-300 text-sm list-disc list-inside space-y-1 mb-2">
                  <li>Less than 10 in-game minutes have passed</li>
                  <li>No goals have been scored</li>
                  <li>There is a valid reason (e.g. mass lag-out), with video proof required</li>
                </ul>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">1.3.2 Lag-Out Protocol</h4>
                <p className="text-gray-300 text-sm">If opponents are lagging out, goals will not count and the match must be reset before the 10th minute.</p>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">1.3.3 Multiple Quit Rule</h4>
                <p className="text-gray-300 text-sm">If a match is quit early three times, an admin or system manager will confirm whether the game should be defaulted or rescheduled.</p>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">1.3.4 Mid-Game Crashes</h4>
                <p className="text-gray-300 text-sm">If 2 or more players crash or lag out mid-game before halftime and the score is 0-0, the game may be resumed from where it left off with video proof.</p>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                                 <h4 className="font-medium text-white mb-2">1.3.5 Position Restrictions</h4>
                 <p className="text-gray-300 text-sm mb-2">Use of the &quot;Any&quot; position is strictly prohibited.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span><strong>Penalty:</strong> 1-0 default loss.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1.4 Player Conduct */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">1.4 Player Conduct</h3>
            <div className="space-y-4">
              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">1.4.1 Unsportsmanlike Behavior</h4>
                <p className="text-gray-300 text-sm">Unsportsmanlike behavior including abuse, toxicity, or offensive conduct will result in suspension or disqualification, depending on severity.</p>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">1.4.2 Free Kick Violations</h4>
                <p className="text-gray-300 text-sm mb-2">Standing beside the goalkeeper or behind the wall during free kicks is not allowed.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span><strong>Penalty:</strong> ₦5,000 fine, 2-match ban for involved players, goal awarded to opposition, and repeated offences may lead to point deduction.</span>
                </div>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">1.4.3 Fake Goalkeepers</h4>
                <p className="text-gray-300 text-sm">Use of fake goalkeepers is prohibited. This includes entering the lobby as a goalkeeper and quitting. All goalkeepers must be duly registered to the club.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MEDIA & MATCH DOCUMENTATION */}
        <div className="bg-[#222] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">2. MEDIA & MATCH DOCUMENTATION</h2>
          </div>

          {/* 2.1 Match Broadcasting & Highlights */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">2.1 Match Broadcasting & Highlights</h3>
            <div className="space-y-4">
              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">2.1.1 Live Streaming Requirement</h4>
                <p className="text-gray-300 text-sm mb-2">Teams must provide a live stream link for each game.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span><strong>Penalty:</strong> ₦5,000 fine per match and default loss if no stream proof is available.</span>
                </div>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">2.1.2 Match Highlights</h4>
                <p className="text-gray-300 text-sm mb-2">Match highlights must be submitted within 24 hours of match completion.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span><strong>Penalty:</strong> ₦5,000 fine.</span>
                </div>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">2.1.3 Social Media Updates</h4>
                <p className="text-gray-300 text-sm mb-2">Each team must post pre- and post-match updates on their official social media accounts.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span><strong>Penalty:</strong> ₦5,000 fine per game.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2.2 Player Data Compliance & Stat Verification */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">2.2 Player Data Compliance & Stat Verification</h3>
            <div className="space-y-4">
              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">2.2.1 Player Heights</h4>
                <p className="text-gray-300 text-sm mb-2">Player heights must be shown on the live stream or submitted after the match.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  <span><strong>Penalty:</strong> Default loss if not submitted.</span>
                </div>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">2.2.2 Stat Verification</h4>
                <p className="text-gray-300 text-sm mb-2">Uploaded match stats must match the image proof.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span><strong>Penalty:</strong> Any stat without proof is nullified, and the player receives a 3-match ban, ₦50,000 fine, and disqualification from season awards.</span>
                </div>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">2.2.3 Height Restrictions</h4>
                <div className="text-gray-300 text-sm space-y-2">
                                     <div><strong>Player Height Limits:</strong></div>
                   <ul className="list-disc list-inside space-y-1 ml-4">
                     <li>CBs: Max height = 6&apos;2&quot; (189cm)</li>
                     <li>All other outfield players: Max height = 6&apos;0&quot; (184cm)</li>
                     <li>GK: No height restriction</li>
                   </ul>
                   <div className="mt-3"><strong>Formation Rules:</strong></div>
                   <ul className="list-disc list-inside space-y-1 ml-4">
                     <li>3-back formations: Allowed 3 CBs at 6&apos;2&quot;</li>
                     <li>4-back formations: Allowed 2 CBs at 6&apos;2&quot; + 1 CDM at 6&apos;2&quot;</li>
                     <li>5-back formations: Allowed 3 CBs at 6&apos;2&quot;</li>
                   </ul>
                </div>
                <div className="flex items-center gap-2 text-red-400 text-xs mt-2">
                  <AlertTriangle className="h-3 w-3" />
                  <span><strong>Penalty:</strong> Any player using a higher height than permitted results in a default loss.</span>
                </div>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">2.2.4 Game Glitch Protocol</h4>
                <p className="text-gray-300 text-sm mb-2">In case of a game glitch, teams must record the last 5 minutes to capture player ratings.</p>
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span><strong>Penalty:</strong> Failure to upload player stats results in a ₦1,000 fine per player.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MATCH ADMINISTRATION */}
        <div className="bg-[#222] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">3. MATCH ADMINISTRATION</h2>
          </div>

          {/* 3.1 Defaults, No-shows & Scheduling */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">3.1 Defaults, No-shows & Scheduling</h3>
            <div className="space-y-4">
              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">3.1.1 Default Claims</h4>
                <p className="text-gray-300 text-sm">Default claims must be submitted within 24 hours of the match. Late claims will not be reviewed.</p>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">3.1.2 Default Goal Awards</h4>
                <p className="text-gray-300 text-sm">Only 0-0 matches are eligible for default goal awards. All goals scored by the infringing team will be cancelled, while the non-infringing team&apos;s goals will stand.</p>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">3.1.3 Punctuality Requirements</h4>
                <div className="text-gray-300 text-sm space-y-2">
                  <p>Teams must arrive on time:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Late (15+ minutes) = ₦5,000 fine</li>
                    <li>No-show (30+ minutes) = ₦10,000 fine + default loss</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">3.1.4 Rescheduling Policy</h4>
                <p className="text-gray-300 text-sm">No more match rescheduling by teams is allowed. Only the admin team may issue a general league rescheduling.</p>
              </div>
            </div>
          </div>

          {/* 3.2 Other Situations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">3.2 Other Situations</h3>
            <div className="bg-[#111] rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">3.2.1 Uncovered Situations</h4>
              <p className="text-gray-300 text-sm mb-2">Any situation not explicitly covered in these rules will be handled case-by-case by the admin team.</p>
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <Zap className="h-3 w-3" />
                <span><strong>Penalty:</strong> May include fines, suspensions, point deductions, or other sanctions deemed appropriate.</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. LEAGUE TRANSFER POLICY UPDATE */}
        <div className="bg-[#222] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">4. LEAGUE TRANSFER POLICY UPDATE</h2>
          </div>

          {/* 4.1 Squad Limitations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">4.1 Squad Limitations</h3>
            <div className="space-y-4">
              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">4.1.1 Maximum Squad Size</h4>
                <p className="text-gray-300 text-sm">Each team is limited to a maximum of 16 registered players.</p>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">4.1.2 Free Agent Status</h4>
                <p className="text-gray-300 text-sm">Any player not listed among the 16 registered players of a team is automatically considered a free agent.</p>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">4.1.3 Free Agent Business</h4>
                <p className="text-gray-300 text-sm">Free agents cannot be used to negotiate or conduct any kind of business (transfers, loans, etc.) unless they are officially signed and registered.</p>
              </div>
            </div>
          </div>

          {/* 4.2 Abolishment of Loan Deals */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">4.2 Abolishment of Loan Deals</h3>
            <div className="bg-[#111] rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">4.2.1 Loans Removed</h4>
              <p className="text-gray-300 text-sm">Loan transfers are no longer permitted under any circumstance. This change is to streamline the transfer process and eliminate loopholes that compromise fairness and consistency in team management.</p>
            </div>
          </div>

          {/* 4.3 Permissible Transfer Activities */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">4.3 Permissible Transfer Activities</h3>
            <div className="space-y-4">
              <div className="bg-[#111] rounded-lg p-4">
                <p className="text-gray-300 text-sm mb-4">Moving forward, only the following three types of player movements are allowed:</p>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-white text-sm">Permanent Transfer</h5>
                      <p className="text-gray-300 text-xs">A player is permanently transferred from one team to another with full ownership rights.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-white text-sm">Swap Deal</h5>
                      <p className="text-gray-300 text-xs">A direct player-for-player exchange between two teams. Both players must be part of their respective 16-man registered squads.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-white text-sm">Contract Termination</h5>
                      <p className="text-gray-300 text-xs">A player&apos;s contract can be terminated by mutual agreement, making them a free agent and eligible to be signed by any team.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4.4 Contract Regulations */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">4.4 Contract Regulations</h3>
            <div className="space-y-4">
              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">4.4.1 Maximum Contract Length</h4>
                <p className="text-gray-300 text-sm">Maximum contract length is 6 seasons. If no new contract is negotiated before the end of the current agreement, the player becomes a free agent.</p>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">4.4.2 New Contract Cap</h4>
                <p className="text-gray-300 text-sm">New contract cap is 3 seasons. After completing the 3rd season, a release clause becomes a viable option.</p>
              </div>

              <div className="bg-[#111] rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">4.4.3 Release Clause Policy</h4>
                <div className="text-gray-300 text-sm space-y-2">
                  <p>The release clause is calculated based on the player&apos;s fantasy price:</p>
                  <div className="bg-[#0a0a0a] rounded p-3 border-l-4 border-green-500">
                    <p className="text-green-400 font-medium">Example: Fantasy Price of ₦15m = Release Clause of ₦150k</p>
                  </div>
                                      <p className="text-xs text-gray-400">Activation of the release clause is subject to the player&apos;s agreement.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4.5 League Transfer Tax Adjustment */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">4.5 League Transfer Tax Adjustment</h3>
            <div className="bg-[#111] rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">4.5.1 Commission Fee Increase</h4>
              <p className="text-gray-300 text-sm mb-2">The league commission fee on transfers has been increased from 5% to 10%.</p>
              <p className="text-gray-400 text-xs">This fee applies to all permanent transfers and swap deals involving valuation differences.</p>
            </div>
          </div>

          {/* 4.6 Enforcement */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-400 mb-4">4.6 Enforcement</h3>
            <div className="bg-[#111] rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">4.6.1 Violations</h4>
              <p className="text-gray-300 text-sm mb-2">Teams found violating these rules (e.g., fielding unregistered players or conducting business with free agents) will face disciplinary actions.</p>
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <AlertTriangle className="h-3 w-3" />
                <span><strong>Penalties include:</strong> Match forfeitures, fines, or point deductions.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#222] rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Rules Enforcement</h3>
          </div>
          <p className="text-gray-300 text-sm">
            These rules are enforced strictly and consistently. All participants are expected to familiarize themselves 
            with these regulations. Ignorance of the rules is not an acceptable defense for violations.
          </p>
          <p className="text-amber-400 text-xs mt-2">
            Rules are subject to updates. Check regularly for any changes.
          </p>
        </div>
      </div>
    </div>
  )
}